"""
Clone and Explore Dataset: kd13/EngineeringConcepts-Instruct-v1
Direct Hugging Face dataset downloader and exploratory analysis pipeline.
Downloads 'Engineering.parquet' (25,875 records), parses domains, difficulties,
and creates formatted train/val/test splits for instruction fine-tuning.
"""

import os
import sys
import json
import urllib.request
import pandas as pd
import numpy as np

# Ensure UTF-8 stdout encoding for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "engineering_concepts_instruct_v1")
os.makedirs(DATA_DIR, exist_ok=True)
PARQUET_PATH = os.path.join(DATA_DIR, "Engineering.parquet")
HF_PARQUET_URL = "https://huggingface.co/datasets/kd13/EngineeringConcepts-Instruct-v1/resolve/main/Engineering.parquet"

def download_and_explore():
    print("=" * 70)
    print("[*] Cloning & Ingesting Dataset: kd13/EngineeringConcepts-Instruct-v1")
    print("=" * 70)

    # 1. Download parquet if not already present
    if not os.path.exists(PARQUET_PATH) or os.path.getsize(PARQUET_PATH) < 1000:
        print(f"[>] Downloading from {HF_PARQUET_URL} ...")
        urllib.request.urlretrieve(HF_PARQUET_URL, PARQUET_PATH)
        print(f"[+] Downloaded {PARQUET_PATH} ({os.path.getsize(PARQUET_PATH):,} bytes)")
    else:
        print(f"[+] Found existing local copy: {PARQUET_PATH} ({os.path.getsize(PARQUET_PATH):,} bytes)")

    # 2. Load into DataFrame
    df = pd.read_parquet(PARQUET_PATH)
    print(f"\n[+] Total Engineering Samples: {len(df):,}")
    print(f"[+] Schema / Columns: {df.columns.tolist()}")

    # 3. Domain & Difficulty Distribution
    domain_counts = df['domain'].value_counts().to_dict()
    difficulty_counts = df['difficulty'].value_counts().to_dict()
    task_counts = df['task_type'].value_counts().to_dict() if 'task_type' in df.columns else {}

    print("\n[*] Domain Breakdown:")
    for dom, count in list(domain_counts.items())[:8]:
        pct = (count / len(df)) * 100
        print(f"  - {dom:<30}: {count:>5,} ({pct:.1f}%)")

    print("\n[*] Difficulty Breakdown:")
    for diff, count in difficulty_counts.items():
        pct = (count / len(df)) * 100
        print(f"  - {diff:<15}: {count:>5,} ({pct:.1f}%)")

    # 4. Formatted Alpaca / ChatML Prompt Template
    def format_chat_prompt(row):
        system_msg = f"You are an expert AI Engineering Tutor specializing in {str(row['domain']).replace('_', ' ').title()}."
        user_msg = row['user']
        assistant_msg = row['assistant']
        formatted_text = f"<|im_start|>system\n{system_msg}<|im_end|>\n<|im_start|>user\n{user_msg}<|im_end|>\n<|im_start|>assistant\n{assistant_msg}<|im_end|>"
        return formatted_text

    df['formatted_text'] = df.apply(format_chat_prompt, axis=1)

    # 5. Stratified Train / Validation Split (90% Train, 10% Validation)
    np.random.seed(42)
    shuffled_indices = np.random.permutation(len(df))
    split_point = int(len(df) * 0.90)

    train_df = df.iloc[shuffled_indices[:split_point]].copy()
    val_df = df.iloc[shuffled_indices[split_point:]].copy()

    print(f"\n[*] Splits Created:")
    print(f"  - Training Set:   {len(train_df):,} samples (90%)")
    print(f"  - Validation Set: {len(val_df):,} samples (10%)")

    # 6. Save JSONL & CSV Files
    train_jsonl = os.path.join(DATA_DIR, "train.jsonl")
    val_jsonl = os.path.join(DATA_DIR, "val.jsonl")
    full_jsonl = os.path.join(DATA_DIR, "engineering_instruct_all.jsonl")
    metadata_json = os.path.join(DATA_DIR, "dataset_summary.json")

    train_df.to_json(train_jsonl, orient="records", lines=True, force_ascii=False)
    val_df.to_json(val_jsonl, orient="records", lines=True, force_ascii=False)
    df.to_json(full_jsonl, orient="records", lines=True, force_ascii=False)

    summary = {
        "dataset_id": "kd13/EngineeringConcepts-Instruct-v1",
        "huggingface_url": "https://huggingface.co/datasets/kd13/EngineeringConcepts-Instruct-v1",
        "total_samples": len(df),
        "train_samples": len(train_df),
        "val_samples": len(val_df),
        "columns": df.columns.tolist(),
        "domain_distribution": domain_counts,
        "difficulty_distribution": difficulty_counts,
        "task_type_distribution": task_counts,
        "sample_prompts": [
            {
                "domain": row['domain'],
                "difficulty": row['difficulty'],
                "topic": row['topic'],
                "user": row['user'],
                "assistant_preview": row['assistant'][:200] + "..."
            }
            for _, row in df.head(3).iterrows()
        ]
    }

    with open(metadata_json, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"\n[+] Saved Clean Split Files:")
    print(f"  - Full JSONL: {full_jsonl}")
    print(f"  - Train JSONL: {train_jsonl}")
    print(f"  - Val JSONL:   {val_jsonl}")
    print(f"  - Metadata:    {metadata_json}")
    print("=" * 70)

    return df, train_df, val_df, summary

if __name__ == "__main__":
    download_and_explore()
