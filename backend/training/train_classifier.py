import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "iceberg_features.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "iceberg_classifier.joblib")

def train_iceberg_classifier():
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = pd.read_csv(DATA_PATH)
    
    feature_cols = [
        "sar_backscatter_mean",
        "sar_backscatter_std",
        "texture_contrast",
        "texture_homogeneity",
        "object_area_km2",
        "ice_edge_distance_km",
        "wind_speed_knots",
        "ocean_current_speed_ms",
        "wave_height_m",
        "sea_ice_concentration",
        "temperature_c",
        "confidence_percent"
    ]
    
    X = df[feature_cols]
    y = df["hazard_class"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    
    print("=== ICEBERG HAZARD CLASSIFIER EVALUATION ===")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print("\nDetailed Report:\n", classification_report(y_test, y_pred, zero_division=0))
    
    joblib.dump({"model": clf, "feature_names": feature_cols}, MODEL_PATH)
    print(f"Model successfully saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_iceberg_classifier()
