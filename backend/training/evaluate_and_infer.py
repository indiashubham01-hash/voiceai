"""
MINDMESH-NEXUS: Engineering Concepts Model Evaluation & Inference Harness
Evaluates the trained instruction-tuned model on diverse engineering concepts
and generates Socratic answers with domain attribution.
"""

import os
import sys
import json
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# Safe UTF-8 printing
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models", "engineering_instruct_model")
DEFAULT_BASE = "distilgpt2"

TEST_PROMPTS = [
    {
        "domain": "Computer Networks & Systems",
        "prompt": "Explain how TCP Slow Start and Congestion Avoidance algorithms prevent network collapse."
    },
    {
        "domain": "Modern LLMs & AI Architecture",
        "prompt": "What is Key-Value (KV) Caching in Transformer decoder self-attention, and why does it reduce inference latency?"
    },
    {
        "domain": "Internet of Things (IoT)",
        "prompt": "Compare MQTT publish-subscribe architecture with HTTP REST polling for low-power sensor nodes."
    },
    {
        "domain": "Electronics & Semiconductor Physics",
        "prompt": "What causes subthreshold leakage current in sub-7nm FinFET and Gate-All-Around (GAA) transistors?"
    }
]

_CACHED_MODEL = None
_CACHED_TOKENIZER = None

def get_cached_model_and_tokenizer():
    global _CACHED_MODEL, _CACHED_TOKENIZER
    if _CACHED_MODEL is None or _CACHED_TOKENIZER is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model_path = MODEL_DIR if os.path.exists(os.path.join(MODEL_DIR, "config.json")) else DEFAULT_BASE
        
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        model = AutoModelForCausalLM.from_pretrained(model_path)
        model.to(device)
        model.eval()
        
        _CACHED_MODEL = (model, device, model_path)
        _CACHED_TOKENIZER = tokenizer
        
    return _CACHED_MODEL, _CACHED_TOKENIZER

def generate_engineering_explanation(prompt: str, domain: str = "Engineering", max_new_tokens: int = 80):
    (model, device, model_path), tokenizer = get_cached_model_and_tokenizer()

    formatted_input = f"<|im_start|>system\nYou are an expert AI Engineering Professor in {domain}.<|im_end|>\n<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n"
    inputs = tokenizer(formatted_input, return_tensors="pt").to(device)

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.15,
            pad_token_id=tokenizer.pad_token_id
        )

    generated_text = tokenizer.decode(output_ids[0], skip_special_tokens=False)
    
    # Extract assistant reply
    if "<|im_start|>assistant" in generated_text:
        assistant_part = generated_text.split("<|im_start|>assistant")[-1].replace("<|im_end|>", "").strip()
    else:
        assistant_part = generated_text

    return {
        "domain": domain,
        "prompt": prompt,
        "model_used": model_path,
        "response": assistant_part
    }

def run_evaluation_suite():
    print("=" * 70)
    print("🧪 Running Engineering Concepts Model Evaluation Suite")
    print("=" * 70)

    results = []
    for test in TEST_PROMPTS:
        print(f"\n🔬 Domain: [{test['domain']}]")
        print(f"❓ Prompt: {test['prompt']}")
        res = generate_engineering_explanation(test['prompt'], test['domain'])
        print(f"💡 Response Preview:\n{res['response'][:300]}...\n")
        results.append(res)

    eval_output_path = os.path.join(MODEL_DIR, "evaluation_results.json")
    with open(eval_output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Saved evaluation results to {eval_output_path}")
    return results

if __name__ == "__main__":
    run_evaluation_suite()
