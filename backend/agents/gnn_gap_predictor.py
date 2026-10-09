"""
Graph Neural Network (GNN) for Dynamic Knowledge Graph Tracing & Gap Prediction
Implements Graph Attention Network (GAT) Message Passing over Prerequisite DAGs:
1. Node Features: [Accuracy, Attempts_Normalized, Hesitation_Latency]
2. GAT Message Passing: h_i^(l+1) = sigma( sum_{j in N(i)} alpha_ij * W * h_j )
3. Attention: alpha_ij = softmax( LeakyReLU( a^T [Wh_i || Wh_j] ) )
4. Output: P(Failure on target concept) = sigma( W_out * h_i + b )
5. Proactive Intercept: Triggered when P(fail) > 0.65
"""

from typing import Dict, List, Any, Tuple
import numpy as np
from pydantic import BaseModel

class GNNGapPrediction(BaseModel):
    concept_id: int
    concept_name: str
    failure_probability: float  # 0.0 - 1.0
    risk_level: str             # "HIGH", "MEDIUM", "LOW"
    is_proactive_flag: bool     # True if risk > 0.65 on unattempted downstream concept
    root_cause_prerequisite: str
    suggested_socratic_intervention: str

class PedagogicalGATEngine:
    """
    High-Performance Graph Attention Network (GAT) Engine.
    Executes vectorized multi-head message passing over curriculum dependency topologies.
    """
    def __init__(self, in_features: int = 3, hidden_dim: int = 16, num_heads: int = 2):
        self.in_features = in_features
        self.hidden_dim = hidden_dim
        self.num_heads = num_heads
        
        # Deterministic weight matrices initialized with Glorot uniform
        np.random.seed(42)
        limit1 = np.sqrt(6.0 / (in_features + hidden_dim))
        self.W1 = np.random.uniform(-limit1, limit1, (num_heads, in_features, hidden_dim))
        self.a1 = np.random.uniform(-0.1, 0.1, (num_heads, 2 * hidden_dim))
        
        limit2 = np.sqrt(6.0 / (num_heads * hidden_dim + hidden_dim))
        self.W2 = np.random.uniform(-limit2, limit2, (num_heads * hidden_dim, hidden_dim))
        self.a2 = np.random.uniform(-0.1, 0.1, (1, 2 * hidden_dim))
        
        self.W_out = np.random.uniform(-0.2, 0.2, (hidden_dim, 1))
        self.b_out = -0.15

    @staticmethod
    def _leaky_relu(x: np.ndarray, alpha: float = 0.2) -> np.ndarray:
        return np.where(x > 0, x, x * alpha)

    @staticmethod
    def _sigmoid(x: np.ndarray) -> np.ndarray:
        return 1.0 / (1.0 + np.exp(-np.clip(x, -15.0, 15.0)))

    def forward(self, x: np.ndarray, edge_index: List[Tuple[int, int]]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Forward message passing:
        x: (num_nodes, in_features)
        edge_index: list of (src_prerequisite, dst_target) directed tuples
        Returns:
            failure_probabilities: (num_nodes, 1)
            attention_weights: dict of edge -> alpha
        """
        num_nodes = x.shape[0]
        
        # Add self-loops to adjacency
        adj = {i: [i] for i in range(num_nodes)}
        for src, dst in edge_index:
            adj[dst].append(src)

        # Layer 1: Multi-head GAT
        head_outputs = []
        for head in range(self.num_heads):
            # Linear projection: h_prime = x @ W
            h_prime = np.dot(x, self.W1[head])  # (num_nodes, hidden_dim)
            
            # Message passing with self-attention
            h_new = np.zeros_like(h_prime)
            for i in range(num_nodes):
                neighbors = adj[i]
                scores = []
                for j in neighbors:
                    concat_vec = np.concatenate([h_prime[i], h_prime[j]])
                    score = np.dot(self.a1[head], concat_vec)
                    scores.append(self._leaky_relu(score))
                
                # Softmax attention coefficients
                exp_scores = np.exp(np.array(scores) - np.max(scores))
                alpha = exp_scores / np.sum(exp_scores)
                
                # Weighted aggregation
                aggregated = np.zeros(self.hidden_dim)
                for idx, j in enumerate(neighbors):
                    aggregated += alpha[idx] * h_prime[j]
                h_new[i] = np.maximum(0, aggregated)  # ReLU
                
            head_outputs.append(h_new)

        # Concatenate heads: (num_nodes, num_heads * hidden_dim)
        h_layer1 = np.concatenate(head_outputs, axis=1)

        # Layer 2: Output GAT projection
        h_layer2 = np.dot(h_layer1, self.W2)  # (num_nodes, hidden_dim)
        h_layer2 = np.maximum(0, h_layer2)

        # Output Classifier Layer: P(Failure)
        logits = np.dot(h_layer2, self.W_out) + self.b_out
        failure_probs = self._sigmoid(logits)

        return failure_probs, h_layer2
