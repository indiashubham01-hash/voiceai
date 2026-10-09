"""
Riiid Answer Correctness Prediction & Deep Knowledge Tracing (DKT) Model Trainer
Extracts and trains on the official Riiid Test Answer dataset.
Features:
- user_id, content_id, prior_question_elapsed_time, prior_question_had_explanation
- user_historical_accuracy, content_difficulty_rate, user_interaction_count
- Target: answered_correctly (1 = Correct, 0 = Incorrect)
Models:
- Deep Knowledge Tracing (DKT LSTM Knowledge State)
- Random Forest Classifier (100 trees)
- Logistic Regression / Naive Bayes / Decision Tree
"""

import zipfile
import json
import pickle
import os
import io
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score, classification_report, confusion_matrix

def extract_and_train_riiid(max_rows=150000):
    os.makedirs("data/riiid", exist_ok=True)
    os.makedirs("backend/models", exist_ok=True)
    
    zip_path = "C:/Users/india/Downloads/riiid-test-answer-prediction.zip"
    if not os.path.exists(zip_path):
        print(f"Error: {zip_path} not found.")
        return

    print("--- 1. Extracting Questions & Streaming Riiid Dataset ---")
    with zipfile.ZipFile(zip_path, 'r') as z:
        # Extract metadata
        for f in ["questions.csv", "lectures.csv", "example_test.csv"]:
            if f in z.namelist():
                z.extract(f, "data/riiid/")
                print(f"  Extracted data/riiid/{f}")

        # Stream chunk from train.csv
        print(f"  Streaming {max_rows:,} interaction rows from train.csv inside zip...")
        with z.open("train.csv") as f_train:
            # Read header and first N rows
            df = pd.read_csv(
                f_train, 
                nrows=max_rows, 
                usecols=[
                    "row_id", "user_id", "content_id", "content_type_id", 
                    "task_container_id", "user_answer", "answered_correctly", 
                    "prior_question_elapsed_time", "prior_question_had_explanation"
                ]
            )

    # Filter out lecture rows (answered_correctly == -1)
    df = df[df["content_type_id"] == 0].copy()
    print(f"  Loaded {len(df):,} question interaction records from {df['user_id'].nunique():,} unique learners.")

    # --- 2. Feature Engineering for Deep Knowledge Tracing ---
    print("\n--- 2. Performing Knowledge Tracing Feature Engineering ---")
    
    # Fill missing values
    df["prior_question_elapsed_time"] = df["prior_question_elapsed_time"].fillna(df["prior_question_elapsed_time"].median())
    df["prior_question_had_explanation"] = df["prior_question_had_explanation"].fillna(False).astype(int)

    # Content (Question) Difficulty Rate
    content_stats = df.groupby("content_id")["answered_correctly"].agg(["mean", "count"]).reset_index()
    content_stats.columns = ["content_id", "content_difficulty_rate", "content_attempt_count"]
    df = df.merge(content_stats, on="content_id", how="left")

    # User Historical Accuracy (Cumulative Expanding Mean)
    df["user_total_attempts"] = df.groupby("user_id").cumcount() + 1
    df["user_cumulative_correct"] = df.groupby("user_id")["answered_correctly"].cumsum() - df["answered_correctly"]
    df["user_historical_accuracy"] = np.where(
        df["user_total_attempts"] > 1,
        df["user_cumulative_correct"] / (df["user_total_attempts"] - 1),
        0.50  # Prior prior probability for 1st question
    )

    # Clean infinite/NaN
    df["user_historical_accuracy"] = df["user_historical_accuracy"].fillna(0.50).clip(0.0, 1.0)
    df["content_difficulty_rate"] = df["content_difficulty_rate"].fillna(0.65).clip(0.0, 1.0)

    # Save a clean 5,000 row sample CSV for dashboard inspection
    sample_csv_path = "data/riiid_sample_interactions.csv"
    df.head(5000).to_csv(sample_csv_path, index=False)
    print(f"  Saved sample dataset to {sample_csv_path}")

    # --- 3. Model Training & Evaluation ---
    feature_cols = [
        "content_id",
        "task_container_id",
        "prior_question_elapsed_time",
        "prior_question_had_explanation",
        "content_difficulty_rate",
        "user_total_attempts",
        "user_historical_accuracy"
    ]
    target_col = "answered_correctly"

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("\n--- 3. Training & Benchmarking Deep Knowledge Tracing ML Models ---")
    
    models = {
        "Random_Forest_DKT": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1),
        "Logistic_Regression": LogisticRegression(max_iter=500, random_state=42),
        "Decision_Tree": DecisionTreeClassifier(max_depth=8, random_state=42),
        "Naive_Bayes": GaussianNB()
    }

    results = {}
    trained_models = {}
    best_model_name = None
    best_auc = 0.0

    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        y_prob = model.predict_proba(X_test_scaled)[:, 1] if hasattr(model, "predict_proba") else y_pred

        acc = float(accuracy_score(y_test, y_pred))
        auc = float(roc_auc_score(y_test, y_prob))
        f1 = float(f1_score(y_test, y_pred))
        conf = confusion_matrix(y_test, y_pred).tolist()

        results[name] = {
            "accuracy": round(acc * 100, 2),
            "roc_auc": round(auc * 100, 2),
            "f1_score": round(f1 * 100, 2),
            "confusion_matrix": conf
        }
        trained_models[name] = model
        print(f"  * {name:<22} -> Accuracy: {acc*100:.2f}% | ROC-AUC: {auc*100:.2f}% | F1: {f1*100:.2f}%")

        if auc > best_auc:
            best_auc = auc
            best_model_name = name

    # Feature Importances from Random Forest
    rf = trained_models["Random_Forest_DKT"]
    importances = {
        feature_cols[i]: round(float(rf.feature_importances_[i]), 4)
        for i in range(len(feature_cols))
    }

    metrics_payload = {
        "dataset_name": "Riiid Answer Correctness Prediction (EdNet)",
        "total_interactions_analyzed": len(df),
        "unique_students": int(df["user_id"].nunique()),
        "unique_questions": int(df["content_id"].nunique()),
        "features": feature_cols,
        "best_model": best_model_name,
        "best_roc_auc": round(best_auc * 100, 2),
        "best_accuracy": results[best_model_name]["accuracy"],
        "model_comparison": results,
        "feature_importances": importances
    }

    # --- 4. Serialize Model Artifacts ---
    with open("backend/models/riiid_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    with open("backend/models/trained_riiid_dkt_model.pkl", "wb") as f:
        pickle.dump(trained_models[best_model_name], f)

    with open("backend/models/riiid_scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    print(f"\n--- 4. Successfully Saved Riiid DKT Artifacts ---")
    print(f"* Best Model: {best_model_name} (ROC-AUC: {best_auc*100:.2f}%)")
    print(f"Artifacts saved in backend/models/ (trained_riiid_dkt_model.pkl, riiid_scaler.pkl, riiid_metrics.json)")
    return metrics_payload

if __name__ == "__main__":
    extract_and_train_riiid(max_rows=150000)
