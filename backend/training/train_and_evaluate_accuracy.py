"""
Comprehensive Accuracy & Performance Evaluation Suite for kd13/EngineeringConcepts-Instruct-v1
Calculates:
1. Instruction Next-Token Prediction Accuracy (Top-1 & Top-5 Token Accuracy %) on Causal LM
2. Multi-Domain Engineering Classification Accuracy (9 Domains) with Baseline comparison, Confusion Matrix, 95% CIs
3. Difficulty Classification Accuracy (Easy, Medium, Hard)
4. Instruction Concept Overlap & Token Precision/Recall/F1 Accuracy
"""

import os
import sys
import json
import time
import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForCausalLM
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data", "engineering_concepts_instruct_v1")
MODEL_DIR = os.path.join(PROJECT_ROOT, "models", "engineering_instruct_model")
REPORT_PATH = os.path.join(MODEL_DIR, "accuracy_report.json")


def compute_bootstrap_ci(y_true, y_pred, metric_fn=accuracy_score, n_bootstraps=1000, alpha=0.05):
    """Calculates 95% Confidence Interval via empirical bootstrapping."""
    rng = np.random.RandomState(42)
    scores = []
    n = len(y_true)
    for _ in range(n_bootstraps):
        indices = rng.choice(n, size=n, replace=True)
        scores.append(metric_fn(y_true[indices], y_pred[indices]))
    lower = float(np.percentile(scores, 100 * (alpha / 2.0)))
    upper = float(np.percentile(scores, 100 * (1 - alpha / 2.0)))
    return lower, upper


def evaluate_causal_lm_next_token_accuracy(model_path, val_jsonl_path, num_samples=100):
    """
    Computes Next-Token Top-1 and Top-5 Prediction Accuracy on the fine-tuned Causal LM
    over target instruction tokens (ignoring prompt tokens).
    """
    print("=" * 70)
    print("[*] 1. Evaluating Instruction Model Next-Token Accuracy (Top-1 & Top-5)")
    print("=" * 70)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(model_path)
    model.to(device)
    model.eval()

    val_records = []
    with open(val_jsonl_path, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            if idx >= num_samples:
                break
            val_records.append(json.loads(line.strip()))

    total_target_tokens = 0
    correct_top1_tokens = 0
    correct_top5_tokens = 0

    with torch.no_grad():
        for record in val_records:
            prompt = f"<|im_start|>user\n{record['user']}<|im_end|>\n<|im_start|>assistant\n"
            target = f"{record['assistant']}<|im_end|>"
            full_text = prompt + target

            prompt_ids = tokenizer(prompt, return_tensors="pt")["input_ids"]
            full_enc = tokenizer(full_text, return_tensors="pt", max_length=512, truncation=True)
            input_ids = full_enc["input_ids"].to(device)

            prompt_len = prompt_ids.shape[1]
            if input_ids.shape[1] <= prompt_len:
                continue

            outputs = model(input_ids)
            logits = outputs.logits  # [1, seq_len, vocab_size]

            # Shift logits and targets so token at i predicts token at i+1
            shift_logits = logits[:, prompt_len - 1 : -1, :]
            shift_targets = input_ids[:, prompt_len:]

            target_tokens_count = shift_targets.shape[1]
            if target_tokens_count == 0:
                continue

            total_target_tokens += target_tokens_count

            # Top-1 Accuracy
            top1_preds = torch.argmax(shift_logits, dim=-1)
            correct_top1 = (top1_preds == shift_targets).sum().item()
            correct_top1_tokens += correct_top1

            # Top-5 Accuracy
            top5_preds = torch.topk(shift_logits, k=min(5, shift_logits.size(-1)), dim=-1).indices
            expanded_targets = shift_targets.unsqueeze(-1).expand_as(top5_preds)
            correct_top5 = (top5_preds == expanded_targets).any(dim=-1).sum().item()
            correct_top5_tokens += correct_top5

    top1_acc = (correct_top1_tokens / max(1, total_target_tokens)) * 100.0
    top5_acc = (correct_top5_tokens / max(1, total_target_tokens)) * 100.0

    print(f"  [+] Evaluated Target Tokens: {total_target_tokens:,}")
    print(f"  [+] Next-Token Top-1 Accuracy: {top1_acc:.2f}%")
    print(f"  [+] Next-Token Top-5 Accuracy: {top5_acc:.2f}%")

    return {
        "evaluated_target_tokens": total_target_tokens,
        "next_token_top1_accuracy_pct": round(top1_acc, 2),
        "next_token_top5_accuracy_pct": round(top5_acc, 2)
    }


def evaluate_domain_and_difficulty_classification(parquet_path):
    """
    Trains and benchmarks classification models on the full 25,875 engineering concept queries:
    - Domain Classification (9 domains)
    - Difficulty Classification (3 levels)
    - Baseline Comparison (Majority class vs ML Classifier)
    - 95% Confidence Intervals via Bootstrapping
    """
    print("\n" + "=" * 70)
    print("[*] 2. Evaluating Engineering Domain & Difficulty Classification on Full Dataset")
    print("=" * 70)

    df = pd.read_parquet(parquet_path)
    print(f"  [+] Loaded {len(df):,} total samples from {os.path.basename(parquet_path)}")

    # Split train and test strictly before fitting
    from sklearn.model_selection import train_test_split
    train_df, test_df = train_test_split(df, test_size=0.15, random_state=42, stratify=df['domain'])
    print(f"  [+] Train set: {len(train_df):,} | Test set: {len(test_df):,}")

    # 1. Feature Extraction: TF-IDF on user queries
    tfidf = TfidfVectorizer(max_features=15000, ngram_range=(1, 2), sublinear_tf=True)
    X_train = tfidf.fit_transform(train_df['user'])
    X_test = tfidf.transform(test_df['user'])

    # --- Domain Classification ---
    y_train_domain = train_df['domain'].values
    y_test_domain = test_df['domain'].values
    domain_classes = sorted(list(set(y_train_domain)))

    # Baselines
    dummy_majority = DummyClassifier(strategy="most_frequent")
    dummy_majority.fit(X_train, y_train_domain)
    dummy_acc = accuracy_score(y_test_domain, dummy_majority.predict(X_test)) * 100.0

    # ML Model: Multinomial Logistic Regression with L2 regularization
    domain_clf = LogisticRegression(C=5.0, max_iter=1000, random_state=42)
    domain_clf.fit(X_train, y_train_domain)
    y_pred_domain = domain_clf.predict(X_test)

    domain_acc = accuracy_score(y_test_domain, y_pred_domain) * 100.0
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
        y_test_domain, y_pred_domain, average='macro', zero_division=0
    )
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(
        y_test_domain, y_pred_domain, average='weighted', zero_division=0
    )

    ci_lower, ci_upper = compute_bootstrap_ci(
        y_test_domain, y_pred_domain, metric_fn=accuracy_score, n_bootstraps=500
    )

    # Per-domain metrics
    report_dict = classification_report(y_test_domain, y_pred_domain, output_dict=True, zero_division=0)
    per_domain_metrics = {}
    for dom in domain_classes:
        if dom in report_dict:
            per_domain_metrics[dom] = {
                "precision_pct": round(report_dict[dom]["precision"] * 100.0, 2),
                "recall_pct": round(report_dict[dom]["recall"] * 100.0, 2),
                "f1_score_pct": round(report_dict[dom]["f1-score"] * 100.0, 2),
                "support": int(report_dict[dom]["support"]),
            }

    cm = confusion_matrix(y_test_domain, y_pred_domain, labels=domain_classes)

    print(f"  [+] Naive Majority Baseline Accuracy: {dummy_acc:.2f}%")
    print(f"  [+] Domain Classification Accuracy:   {domain_acc:.2f}% (95% CI: [{ci_lower*100:.2f}%, {ci_upper*100:.2f}%])")
    print(f"  [+] Macro F1-Score:                   {f1_macro*100:.2f}%")
    print(f"  [+] Weighted F1-Score:                {f1_weighted*100:.2f}%")

    # --- Difficulty Classification ---
    y_train_diff = train_df['difficulty'].values
    y_test_diff = test_df['difficulty'].values
    diff_classes = ["easy", "medium", "hard"]

    diff_clf = LogisticRegression(C=2.0, max_iter=1000, random_state=42)
    diff_clf.fit(X_train, y_train_diff)
    y_pred_diff = diff_clf.predict(X_test)

    diff_acc = accuracy_score(y_test_diff, y_pred_diff) * 100.0
    diff_report = classification_report(y_test_diff, y_pred_diff, output_dict=True, zero_division=0)
    per_difficulty_metrics = {}
    for diff in diff_classes:
        if diff in diff_report:
            per_difficulty_metrics[diff] = {
                "precision_pct": round(diff_report[diff]["precision"] * 100.0, 2),
                "recall_pct": round(diff_report[diff]["recall"] * 100.0, 2),
                "f1_score_pct": round(diff_report[diff]["f1-score"] * 100.0, 2),
                "support": int(diff_report[diff]["support"])
            }

    print(f"  [+] Difficulty Classification Accuracy: {diff_acc:.2f}%")

    return {
        "dataset_samples": len(df),
        "test_split_samples": len(test_df),
        "domain_classification": {
            "baseline_majority_accuracy_pct": round(dummy_acc, 2),
            "model_accuracy_pct": round(domain_acc, 2),
            "confidence_interval_95": [round(ci_lower * 100.0, 2), round(ci_upper * 100.0, 2)],
            "macro_precision_pct": round(p_macro * 100.0, 2),
            "macro_recall_pct": round(r_macro * 100.0, 2),
            "macro_f1_pct": round(f1_macro * 100.0, 2),
            "weighted_f1_pct": round(f1_weighted * 100.0, 2),
            "per_domain_performance": per_domain_metrics,
            "confusion_matrix": {
                "labels": domain_classes,
                "matrix": cm.tolist()
            }
        },
        "difficulty_classification": {
            "model_accuracy_pct": round(diff_acc, 2),
            "per_difficulty_performance": per_difficulty_metrics
        }
    }


def compute_token_overlap_and_rouge_accuracy(val_jsonl_path, model_path, num_samples=30):
    """
    Computes Instruction Token Precision, Recall, and F1 (ROUGE-1 style) Accuracy
    between generated responses and ground truth teacher explanations.
    """
    print("\n" + "=" * 70)
    print("[*] 3. Evaluating Instruction Semantic & Token Match Accuracy")
    print("=" * 70)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(model_path)
    model.to(device)
    model.eval()

    val_records = []
    with open(val_jsonl_path, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            if idx >= num_samples:
                break
            val_records.append(json.loads(line.strip()))

    token_precisions = []
    token_recalls = []
    token_f1s = []

    for item in val_records:
        prompt = f"<|im_start|>user\n{item['user']}<|im_end|>\n<|im_start|>assistant\n"
        inputs = tokenizer(prompt, return_tensors="pt").to(device)

        with torch.no_grad():
            output_tokens = model.generate(
                **inputs,
                max_new_tokens=80,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id,
            )

        gen_text = tokenizer.decode(output_tokens[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
        ref_text = item["assistant"]

        gen_words = set(gen_text.lower().split())
        ref_words = set(ref_text.lower().split())

        if not gen_words or not ref_words:
            continue

        overlap = gen_words.intersection(ref_words)
        prec = len(overlap) / len(gen_words)
        rec = len(overlap) / len(ref_words)
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0

        token_precisions.append(prec)
        token_recalls.append(rec)
        token_f1s.append(f1)

    avg_prec = float(np.mean(token_precisions)) * 100.0 if token_precisions else 0.0
    avg_rec = float(np.mean(token_recalls)) * 100.0 if token_recalls else 0.0
    avg_f1 = float(np.mean(token_f1s)) * 100.0 if token_f1s else 0.0

    print(f"  [+] Average Token Precision: {avg_prec:.2f}%")
    print(f"  [+] Average Token Recall:    {avg_rec:.2f}%")
    print(f"  [+] Average Token F1 Score:  {avg_f1:.2f}%")

    return {
        "samples_evaluated": len(val_records),
        "token_precision_pct": round(avg_prec, 2),
        "token_recall_pct": round(avg_rec, 2),
        "token_f1_pct": round(avg_f1, 2)
    }


def main():
    start_time = time.time()
    parquet_path = os.path.join(DATA_DIR, "Engineering.parquet")
    val_jsonl = os.path.join(DATA_DIR, "val.jsonl")

    # 1. Causal LM Next-Token Accuracy
    next_token_metrics = evaluate_causal_lm_next_token_accuracy(MODEL_DIR, val_jsonl, num_samples=100)

    # 2. Domain & Difficulty Classification Accuracy
    classification_metrics = evaluate_domain_and_difficulty_classification(parquet_path)

    # 3. Instruction Concept Match Accuracy
    token_match_metrics = compute_token_overlap_and_rouge_accuracy(val_jsonl, MODEL_DIR, num_samples=25)

    elapsed = time.time() - start_time

    # Compile Final Consolidated Accuracy Report
    report = {
        "dataset": "kd13/EngineeringConcepts-Instruct-v1",
        "evaluation_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "elapsed_seconds": round(elapsed, 2),
        "summary_accuracy_percentages": {
            "domain_classification_accuracy": classification_metrics["domain_classification"]["model_accuracy_pct"],
            "difficulty_classification_accuracy": classification_metrics["difficulty_classification"]["model_accuracy_pct"],
            "next_token_top1_accuracy": next_token_metrics["next_token_top1_accuracy_pct"],
            "next_token_top5_accuracy": next_token_metrics["next_token_top5_accuracy_pct"],
            "instruction_token_f1_accuracy": token_match_metrics["token_f1_pct"]
        },
        "next_token_prediction": next_token_metrics,
        "classification_benchmarks": classification_metrics,
        "instruction_match": token_match_metrics
    }

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n" + "=" * 70)
    print(f"CONSOLIDATED ACCURACY SUMMARY for 'kd13/EngineeringConcepts-Instruct-v1'")
    print("=" * 70)
    print(f"  * Engineering Domain Classification Accuracy:     {report['summary_accuracy_percentages']['domain_classification_accuracy']}%")
    print(f"  * Engineering Difficulty Classification Accuracy: {report['summary_accuracy_percentages']['difficulty_classification_accuracy']}%")
    print(f"  * Next-Token Top-1 Prediction Accuracy:            {report['summary_accuracy_percentages']['next_token_top1_accuracy']}%")
    print(f"  * Next-Token Top-5 Prediction Accuracy:            {report['summary_accuracy_percentages']['next_token_top5_accuracy']}%")
    print(f"  * Instruction Token F1 Match Score:                {report['summary_accuracy_percentages']['instruction_token_f1_accuracy']}%")
    print("=" * 70)
    print(f"[+] Full Accuracy Report successfully written to:\n    {REPORT_PATH}")


if __name__ == "__main__":
    main()
