import json
from agents.gnn_pipeline import gnn_pipeline

res = gnn_pipeline.evaluate_student_knowledge_graph(student_name="Aarav Sharma", subject="Science")
print("=== GNN Knowledge Graph Execution Result ===")
print("Model:", res["gnn_model"])
print("Proactive Intercepts Flagged:", res["proactive_intercept_count"])
print("Path Redesign Recommendation:\n ", res["path_redesign_recommendation"])
print("\nNode Predictions:")
for p in res["node_predictions"]:
    print(f"  • Node {p['concept_id']}: {p['concept_name']:<42} -> Fail Risk: {p['failure_probability']}% | Level: {p['risk_level']:<6} | Proactive Flag: {p['is_proactive_flag']}")
