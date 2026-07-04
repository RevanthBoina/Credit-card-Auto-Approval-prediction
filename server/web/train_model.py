"""
Training script for the Credit Card Approval model.

Generates synthetic training data matching the new 13-field schema (NO Credit Score):
    Age, Debt, YearsEmployed, Gender, Married, BankCustomer,
    EducationLevel, Ethnicity, PriorDefault, Employed, DriversLicense,
    Citizen, Income

Outputs:
    models/credit_approval_model.pkl

Run:
    cd web
    pip install -r requirements.txt
    python train_model.py
"""

import os
import random
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "credit_approval_model.pkl")

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)


def generate_synthetic_data(n_samples: int = 5000) -> pd.DataFrame:
    """Generate synthetic credit card approval dataset."""
    
    # Numeric features with realistic distributions
    age = np.random.normal(40, 12, n_samples).clip(18, 80).astype(int)
    debt = np.random.exponential(5000, n_samples).clip(0, 50000)
    years_employed = np.random.exponential(5, n_samples).clip(0, 40)
    income = np.random.lognormal(10.5, 0.8, n_samples).clip(5000, 200000)
    
    # Categorical features
    gender = np.random.choice(["Male", "Female"], n_samples)
    married = np.random.choice(["Yes", "No"], n_samples, p=[0.6, 0.4])
    bank_customer = np.random.choice(["Yes", "No"], n_samples, p=[0.7, 0.3])
    
    education_level = np.random.choice(
        ["none", "high_school", "bachelors", "masters", "phd"],
        n_samples, p=[0.05, 0.35, 0.40, 0.15, 0.05]
    )
    
    ethnicity = np.random.choice(
        ["white", "black", "asian", "latino", "other"],
        n_samples, p=[0.60, 0.12, 0.10, 0.10, 0.08]
    )
    
    prior_default = np.random.choice(["Yes", "No"], n_samples, p=[0.20, 0.80])
    employed = np.random.choice(["Yes", "No"], n_samples, p=[0.75, 0.25])
    drivers_license = np.random.choice(["Yes", "No"], n_samples, p=[0.80, 0.20])
    
    citizen = np.random.choice(
        ["by birth", "by other means", "temporary"],
        n_samples, p=[0.85, 0.12, 0.03]
    )
    
    # Create DataFrame
    df = pd.DataFrame({
        "Age": age,
        "Debt": debt,
        "YearsEmployed": years_employed,
        "Gender": gender,
        "Married": married,
        "BankCustomer": bank_customer,
        "EducationLevel": education_level,
        "Ethnicity": ethnicity,
        "PriorDefault": prior_default,
        "Employed": employed,
        "DriversLicense": drivers_license,
        "Citizen": citizen,
        "Income": income,
    })
    
    return df


def generate_labels(df: pd.DataFrame) -> np.ndarray:
    """
    Generate approval labels based on logical rules with forced balance.
    
    Positive factors: high income, employed, long tenure, educated, bank customer
    Negative factors: prior default, high debt, no employment
    """
    np.random.seed(42)
    scores = np.zeros(len(df))
    
    # Income contribution (most important)
    scores += np.log1p(df["Income"]) / 2
    
    # Employment status
    scores += (df["Employed"] == "Yes").astype(int) * 2.5
    scores += df["YearsEmployed"] / 2
    
    # Age (mature applicants more stable)
    scores += ((df["Age"] - 25) / 8).clip(-1, 4)
    
    # Positive factors
    scores += (df["Married"] == "Yes").astype(int) * 0.8
    scores += (df["BankCustomer"] == "Yes").astype(int) * 1.5
    scores += (df["DriversLicense"] == "Yes").astype(int) * 0.5
    
    # Education
    edu_map = {"none": -0.5, "high_school": 0.5, "bachelors": 1.5, "masters": 2.0, "phd": 2.5}
    scores += df["EducationLevel"].map(edu_map)
    
    # Negative factors
    scores -= (df["PriorDefault"] == "Yes").astype(int) * 4.0
    scores -= df["Debt"] / 5000
    
    # Add noise
    scores += np.random.normal(0, 1.5, len(df))
    
    # Find threshold to get ~50% approval rate
    threshold_low = np.percentile(scores, 45)
    threshold_high = np.percentile(scores, 55)
    threshold = (threshold_low + threshold_high) / 2
    
    labels = (scores > threshold).astype(int)
    return labels


def main():
    print("=" * 60)
    print("Credit Card Approval Model Training")
    print("=" * 60)
    
    # Generate data
    print("\n[1/5] Generating synthetic training data...")
    df = generate_synthetic_data(n_samples=5000)
    print(f"    Generated {len(df)} samples")
    
    # Generate labels
    print("[2/5] Generating approval labels...")
    y = generate_labels(df)
    print(f"    Approved: {y.sum()} ({y.mean()*100:.1f}%)")
    print(f"    Rejected: {len(y) - y.sum()} ({(1-y.mean())*100:.1f}%)")
    
    # Define feature types
    numeric_features = ["Age", "Debt", "YearsEmployed", "Income"]
    categorical_features = [
        "Gender", "Married", "BankCustomer", "EducationLevel",
        "Ethnicity", "PriorDefault", "Employed", "DriversLicense", "Citizen"
    ]
    
    # Split data
    print("[3/5] Splitting train/test...")
    X_train, X_test, y_train, y_test = train_test_split(
        df, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"    Training: {len(X_train)}, Test: {len(X_test)}")
    
    # Create preprocessing pipeline
    print("[4/5] Building and training model...")
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), categorical_features),
        ]
    )
    
    # Full pipeline with logistic regression
    model = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        ))
    ])
    
    # Train
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n    Test Accuracy: {accuracy:.4f}")
    print("\n    Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Rejected", "Approved"]))
    
    # Save model
    print(f"[5/5] Saving model to {MODEL_PATH}...")
    joblib.dump(model, MODEL_PATH)
    print(f"\n    Model saved successfully!")
    
    # Verify
    print("\n" + "=" * 60)
    print("Model training complete!")
    print("=" * 60)
    print(f"\nModel file: {MODEL_PATH}")
    print(f"Features: {numeric_features + categorical_features}")
    print(f"Test accuracy: {accuracy:.4f}")
    print("\nTo run the API:")
    print("    cd web")
    print("    python app.py")


if __name__ == "__main__":
    main()
