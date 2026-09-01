import os
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "risk_regressor.joblib")

_risk_data = None

def load_risk_model():
    global _risk_data
    if _risk_data is None:
        if os.path.exists(MODEL_PATH):
            _risk_data = joblib.load(MODEL_PATH)
            print(f"[ML] Navigation Risk Regressor loaded from {MODEL_PATH}")
        else:
            print(f"[ML WARNING] Risk model not found at {MODEL_PATH}")
    return _risk_data

def predict_navigation_risk(params: dict) -> dict:
    reg_data = load_risk_model()
    
    defaults = {
        "iceberg_distance_km": float(params.get("iceberg_distance_km", 15.0)),
        "iceberg_speed_ms": float(params.get("iceberg_speed_ms", 0.38)),
        "iceberg_confidence": float(params.get("iceberg_confidence", 85.0)),
        "sea_ice_concentration": float(params.get("sea_ice_concentration", 32.0)),
        "wind_speed": float(params.get("wind_speed", 18.0)),
        "visibility_km": float(params.get("visibility_km", 8.5)),
        "wave_height": float(params.get("wave_height", 1.8)),
        "ocean_current_speed": float(params.get("ocean_current_speed", 0.4)),
        "vessel_draft": float(params.get("vessel_draft", 8.2)),
        "vessel_speed": float(params.get("vessel_speed", 12.0)),
        "ice_capability_score": float(params.get("ice_capability_score", 0.8)),
        "submerged_hazard_distance": float(params.get("submerged_hazard_distance", 5.0))
    }
    
    if reg_data is not None:
        feature_names = reg_data["feature_names"]
        input_df = pd.DataFrame([defaults])[feature_names]
        reg = reg_data["model"]
        raw_score = float(reg.predict(input_df)[0])
        risk_score = int(round(max(0, min(100, raw_score))))
    else:
        # Fallback risk formula
        dist = defaults["iceberg_distance_km"]
        sea_ice = defaults["sea_ice_concentration"]
        risk_score = int(round(max(5, min(95, (30.0 - dist) * 2.0 + sea_ice * 0.4))))

    category = "LOW"
    if risk_score >= 75:
        category = "CRITICAL"
    elif risk_score >= 55:
        category = "HIGH"
    elif risk_score >= 35:
        category = "MODERATE"
        
    return {
        "risk_score": risk_score,
        "risk_category": category,
        "model": "Random Forest Regression",
        "features_used": defaults
    }
