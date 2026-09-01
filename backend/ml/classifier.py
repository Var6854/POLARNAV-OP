import os
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "iceberg_classifier.joblib")

_classifier_data = None

def load_classifier():
    global _classifier_data
    if _classifier_data is None:
        if os.path.exists(MODEL_PATH):
            _classifier_data = joblib.load(MODEL_PATH)
            print(f"[ML] Iceberg Hazard Classifier loaded from {MODEL_PATH}")
        else:
            print(f"[ML WARNING] Classifier model not found at {MODEL_PATH}")
    return _classifier_data

def classify_hazard(features_dict: dict) -> dict:
    clf_data = load_classifier()
    
    defaults = {
        "sar_backscatter_mean": -14.2,
        "sar_backscatter_std": 3.1,
        "texture_contrast": 0.55,
        "texture_homogeneity": 0.42,
        "object_area_km2": features_dict.get("estimated_size", features_dict.get("size", 1.8)),
        "ice_edge_distance_km": features_dict.get("ice_edge_distance", 35.0),
        "wind_speed_knots": features_dict.get("wind_speed", 18.0),
        "ocean_current_speed_ms": features_dict.get("ocean_current_speed", 0.4),
        "wave_height_m": features_dict.get("wave_height", 1.8),
        "sea_ice_concentration": features_dict.get("sea_ice_concentration", 32.0),
        "temperature_c": features_dict.get("temperature", -4.2),
        "confidence_percent": features_dict.get("confidence", 85.0)
    }
    
    # Override with explicitly provided keys
    for k in defaults:
        if k in features_dict and features_dict[k] is not None:
            defaults[k] = float(features_dict[k])
            
    if clf_data is not None:
        feature_names = clf_data["feature_names"]
        input_df = pd.DataFrame([defaults])[feature_names]
        clf = clf_data["model"]
        pred_class = clf.predict(input_df)[0]
        probs = clf.predict_proba(input_df)[0]
        classes = list(clf.classes_)
        prob_dict = {classes[i]: float(probs[i]) for i in range(len(classes))}
        
        return {
            "hazard_class": str(pred_class),
            "probabilities": prob_dict,
            "model": "RandomForestClassifier",
            "features_used": defaults
        }
    else:
        # Fallback calculation if model file missing
        size = defaults["object_area_km2"]
        sea_ice = defaults["sea_ice_concentration"]
        h_class = "CRITICAL" if size > 1.5 and sea_ice > 40 else "HIGH" if size > 1.0 else "MODERATE"
        return {
            "hazard_class": h_class,
            "probabilities": {h_class: 0.85},
            "model": "Rule-based Fallback",
            "features_used": defaults
        }
