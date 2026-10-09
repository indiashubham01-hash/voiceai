"""
Machine Learning Training Pipeline for Student Performance & Gap Prediction
Trains: Decision Tree, KNN, Gaussian Naive Bayes, Random Forest
Outputs: Trained models, scalers, confusion matrices, and comparison metrics.
"""

import json
import pickle
import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score

from generate_dataset import generate_student_dataset

def run_training_pipeline():
    os.makedirs("backend/models", exist_ok=True)
    csv_path = "data/student_performance.csv"
    
    if not os.path.exists(csv_path):
        data = generate_student_dataset(n_samples=1200)
    else:
        data = pd.read_csv(csv_path)

    print("--- 1. Loaded Dataset Head ---")
    print(data.head(3))
    print("\nDataset Shape:", data.shape)

    # 2. Preprocessing & Label Encoding
    label_encoders = {}
    encoded_data = data.copy()

    for col in encoded_data.columns:
        if encoded_data[col].dtype == 'object' and col != 'FinalGrade':
            le = LabelEncoder()
            encoded_data[col] = le.fit_transform(encoded_data[col])
            label_encoders[col] = le

    # Target Variable
    target_le = LabelEncoder()
    encoded_data['FinalGrade'] = target_le.fit_transform(encoded_data['FinalGrade'])
    label_encoders['FinalGrade'] = target_le

    X = encoded_data.drop('FinalGrade', axis=1)
    y = encoded_data['FinalGrade']
    feature_names = list(X.columns)

    # 3. Train-Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 4. Standard Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 5. Model Initialization & Training
    models = {
        "Decision_Tree": DecisionTreeClassifier(max_depth=6, random_state=42),
        "KNN": KNeighborsClassifier(n_neighbors=5),
        "Naive_Bayes": GaussianNB(),
        "Random_Forest": RandomForestClassifier(n_estimators=120, max_depth=8, random_state=42)
    }

    results = {}
    trained_objects = {}
    best_model_name = None
    best_acc = 0.0

    print("\n--- 2. Training Models & Evaluating Metrics ---")
    for name, model in models.items():
        # Train
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        
        acc = float(accuracy_score(y_test, y_pred))
        f1_macro = float(f1_score(y_test, y_pred, average='weighted'))
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
        conf_matrix = confusion_matrix(y_test, y_pred).tolist()
        
        report = classification_report(y_test, y_pred, output_dict=True)

        results[name] = {
            "test_accuracy": round(acc * 100, 2),
            "f1_score_weighted": round(f1_macro * 100, 2),
            "cv_mean_accuracy": round(float(np.mean(cv_scores)) * 100, 2),
            "confusion_matrix": conf_matrix,
            "classification_report": report
        }
        trained_objects[name] = model

        print(f"  • {name:<15} -> Test Accuracy: {acc*100:.2f}% | CV Mean: {np.mean(cv_scores)*100:.2f}% | F1: {f1_macro*100:.2f}%")

        if acc > best_acc:
            best_acc = acc
            best_model_name = name

    # 6. Feature Importances (from Random Forest / Decision Tree)
    rf_model = trained_objects["Random_Forest"]
    feature_importances = {
        feature_names[i]: round(float(rf_model.feature_importances_[i]), 4)
        for i in range(len(feature_names))
    }

    metrics_payload = {
        "dataset_size": len(data),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "features": feature_names,
        "classes": list(target_le.classes_),
        "best_model": best_model_name,
        "best_accuracy": round(best_acc * 100, 2),
        "model_comparison": results,
        "feature_importances": feature_importances
    }

    # 7. Serialize Artifacts
    with open("backend/models/model_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    with open("backend/models/trained_student_model.pkl", "wb") as f:
        pickle.dump(trained_objects[best_model_name], f)

    with open("backend/models/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    with open("backend/models/label_encoders.pkl", "wb") as f:
        pickle.dump(label_encoders, f)

    print("\n--- 3. Training Successfully Completed! ---")
    print(f"* Best Performing Model: {best_model_name} with {best_acc*100:.2f}% Accuracy")
    print("Artifacts saved to backend/models/ (trained_student_model.pkl, scaler.pkl, model_metrics.json)")
    return metrics_payload

if __name__ == "__main__":
    run_training_pipeline()
