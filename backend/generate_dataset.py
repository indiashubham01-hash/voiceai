"""
Data Generator & Trainer for Student Performance Model
"""

import numpy as np
import pandas as pd
import os

np.random.seed(42)

def generate_student_dataset(n_samples=1200):
    os.makedirs("data", exist_ok=True)
    
    # 1. Features
    study_hours = np.round(np.random.gamma(shape=3.5, scale=1.5, size=n_samples), 1)
    study_hours = np.clip(study_hours, 0.5, 14.0)
    
    attendance = np.round(np.random.beta(a=7, b=2, size=n_samples) * 100, 1)
    attendance = np.clip(attendance, 40.0, 100.0)
    
    learning_styles = np.random.choice(["Visual", "Auditory", "Kinesthetic", "Reading"], size=n_samples, p=[0.35, 0.25, 0.25, 0.15])
    parental_support = np.random.choice(["Low", "Medium", "High"], size=n_samples, p=[0.25, 0.50, 0.25])
    
    prereq_base = (study_hours * 4.5) + (attendance * 0.4) + np.random.normal(0, 8, n_samples)
    prerequisite_score = np.round(np.clip(prereq_base, 10.0, 99.0), 1)
    
    quiz_base = (prerequisite_score * 0.6) + (study_hours * 3.0) + np.random.normal(0, 6, n_samples)
    quiz_score = np.round(np.clip(quiz_base, 5.0, 100.0), 1)
    
    extracurricular = np.random.choice(["Yes", "No"], size=n_samples, p=[0.45, 0.55])
    
    # 2. Target Variable: Performance Grade / Risk Category
    # Composite score determines final outcome
    support_num = np.where(parental_support == "High", 10, np.where(parental_support == "Medium", 5, 0))
    composite_index = (0.35 * quiz_score) + (0.30 * prerequisite_score) + (0.20 * (study_hours * 8)) + (0.10 * attendance) + support_num
    
    final_grade = []
    for score in composite_index:
        if score < 52:
            final_grade.append("High_Risk_Fail")
        elif score < 70:
            final_grade.append("Medium_Risk_Borderline")
        elif score < 88:
            final_grade.append("Low_Risk_Pass")
        else:
            final_grade.append("Mastery_Distinction")
            
    df = pd.DataFrame({
        "StudyHours": study_hours,
        "Attendance": attendance,
        "LearningStyle": learning_styles,
        "ParentalSupport": parental_support,
        "PrerequisiteScore": prerequisite_score,
        "QuizScore": quiz_score,
        "Extracurricular": extracurricular,
        "FinalGrade": final_grade
    })
    
    csv_path = "data/student_performance.csv"
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} student performance records -> {csv_path}")
    print("\nDataset Distribution:")
    print(df["FinalGrade"].value_counts())
    return df

if __name__ == "__main__":
    generate_student_dataset()
