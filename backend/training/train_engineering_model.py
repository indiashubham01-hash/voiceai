"""
MINDMESH-NEXUS: Engineering Concepts Instruction Model Training Pipeline
Fine-tunes an instruction-following language model on 'kd13/EngineeringConcepts-Instruct-v1'
(25,875 multi-domain engineering instruction samples).
Optimized for rapid convergence and immediate local execution.
"""

import os
import sys
import json
import time
import math
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    get_linear_schedule_with_warmup
)

# Safe UTF-8 printing
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "engineering_concepts_instruct_v1")
MODEL_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models", "engineering_instruct_model")
os.makedirs(MODEL_OUTPUT_DIR, exist_ok=True)

class EngineeringInstructDataset(Dataset):
    def __init__(self, jsonl_path, tokenizer, max_length=128, max_samples=None):
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.samples = []

        with open(jsonl_path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                if max_samples and i >= max_samples:
                    break
                row = json.loads(line.strip())
                self.samples.append(row)

        print(f"[*] Loaded {len(self.samples):,} samples from {os.path.basename(jsonl_path)}", flush=True)

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        item = self.samples[idx]
        domain_name = str(item.get('domain', 'Engineering')).replace('_', ' ').title()
        user_prompt = item.get('user', '')
        assistant_resp = item.get('assistant', '')

        # Standard ChatML formatted template
        prompt_prefix = f"<|im_start|>system\nYou are an expert AI Engineering Professor in {domain_name}.<|im_end|>\n<|im_start|>user\n{user_prompt}<|im_end|>\n<|im_start|>assistant\n"
        full_text = prompt_prefix + assistant_resp + "<|im_end|>"

        enc = self.tokenizer(
            full_text,
            max_length=self.max_length,
            truncation=True,
            padding="max_length",
            return_tensors="pt"
        )

        input_ids = enc["input_ids"].squeeze(0)
        attention_mask = enc["attention_mask"].squeeze(0)

        # Mask prompt tokens with -100 so loss is only calculated on assistant completion
        labels = input_ids.clone()
        prompt_enc = self.tokenizer(prompt_prefix, truncation=True, max_length=self.max_length)
        prompt_len = len(prompt_enc["input_ids"])

        if prompt_len < len(labels):
            labels[:prompt_len] = -100
        labels[attention_mask == 0] = -100

        return {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "labels": labels
        }

def train_model(
    base_model_name: str = "distilgpt2",
    epochs: int = 1,
    batch_size: int = 8,
    learning_rate: float = 5e-5,
    max_train_samples: int = 120,
    max_val_samples: int = 30,
    max_seq_len: int = 128
):
    print("=" * 70, flush=True)
    print(f"[*] Starting Instruction Fine-Tuning on 'kd13/EngineeringConcepts-Instruct-v1'", flush=True)
    print(f"Base Model: {base_model_name}", flush=True)
    print(f"Device:     {'cuda' if torch.cuda.is_available() else 'cpu'}", flush=True)
    print("=" * 70, flush=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # 1. Load Tokenizer
    print(f"[*] Initializing Tokenizer: {base_model_name} ...", flush=True)
    tokenizer = AutoTokenizer.from_pretrained(base_model_name)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # 2. Prepare Datasets
    train_jsonl = os.path.join(DATA_DIR, "train.jsonl")
    val_jsonl = os.path.join(DATA_DIR, "val.jsonl")

    if not os.path.exists(train_jsonl):
        raise FileNotFoundError(f"Missing train dataset at {train_jsonl}. Run clone_and_explore_dataset.py first.")

    train_dataset = EngineeringInstructDataset(train_jsonl, tokenizer, max_length=max_seq_len, max_samples=max_train_samples)
    val_dataset = EngineeringInstructDataset(val_jsonl, tokenizer, max_length=max_seq_len, max_samples=max_val_samples)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    # 3. Load Base Model
    print(f"[*] Loading Causal LM: {base_model_name} ...", flush=True)
    model = AutoModelForCausalLM.from_pretrained(base_model_name)
    model.resize_token_embeddings(len(tokenizer))
    model.to(device)

    # 4. Optimizer & Scheduler
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=0.01)
    total_steps = len(train_loader) * epochs
    warmup_steps = max(1, int(total_steps * 0.1))
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=warmup_steps, num_training_steps=total_steps)

    training_logs = []
    best_val_loss = float("inf")

    print(f"\n[*] Commencing Training Loop: {epochs} Epoch(s), {total_steps} Batches...", flush=True)
    start_time = time.time()

    for epoch in range(epochs):
        model.train()
        total_train_loss = 0.0
        step_count = 0

        for step, batch in enumerate(train_loader):
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            optimizer.zero_grad()
            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss

            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            scheduler.step()

            total_train_loss += loss.item()
            step_count += 1

            if (step + 1) % 5 == 0 or (step + 1) == len(train_loader):
                avg_step_loss = total_train_loss / step_count
                lr = scheduler.get_last_lr()[0]
                print(f"  Epoch [{epoch+1}/{epochs}] | Step [{step+1}/{len(train_loader)}] | Train Loss: {avg_step_loss:.4f} | LR: {lr:.2e}", flush=True)

        avg_train_loss = total_train_loss / len(train_loader)

        # Validation Loop
        model.eval()
        total_val_loss = 0.0
        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                labels = batch["labels"].to(device)

                outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
                total_val_loss += outputs.loss.item()

        avg_val_loss = total_val_loss / len(val_loader) if len(val_loader) > 0 else avg_train_loss
        val_perplexity = math.exp(min(avg_val_loss, 20))

        print(f"\n[+] Epoch {epoch+1} Completed | Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f} | Perplexity: {val_perplexity:.2f}", flush=True)

        training_logs.append({
            "epoch": epoch + 1,
            "train_loss": round(avg_train_loss, 4),
            "val_loss": round(avg_val_loss, 4),
            "perplexity": round(val_perplexity, 2),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        })

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            print(f"  [+] New Best Val Loss ({avg_val_loss:.4f})! Saving checkpoint...", flush=True)
            model.save_pretrained(MODEL_OUTPUT_DIR)
            tokenizer.save_pretrained(MODEL_OUTPUT_DIR)

    elapsed_time = round(time.time() - start_time, 2)
    print(f"\n[+] Training Finished in {elapsed_time}s!", flush=True)

    # Save training report
    report_path = os.path.join(MODEL_OUTPUT_DIR, "training_report.json")
    report = {
        "dataset": "kd13/EngineeringConcepts-Instruct-v1",
        "base_model": base_model_name,
        "epochs": epochs,
        "train_samples": len(train_dataset),
        "val_samples": len(val_dataset),
        "final_train_loss": round(avg_train_loss, 4),
        "final_val_loss": round(avg_val_loss, 4),
        "final_perplexity": round(val_perplexity, 2),
        "elapsed_seconds": elapsed_time,
        "training_history": training_logs,
        "saved_model_path": MODEL_OUTPUT_DIR
    }

    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"[+] Model and report saved to {MODEL_OUTPUT_DIR}", flush=True)
    return report

if __name__ == "__main__":
    train_model(epochs=1, batch_size=8, max_train_samples=120, max_val_samples=30, max_seq_len=128)
