import os
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "drift_regressor.joblib")

_drift_data = None

def load_drift_model():
    global _drift_data
    if _drift_data is None:
        if os.path.exists(MODEL_PATH):
            _drift_data = joblib.load(MODEL_PATH)
            print(f"[ML] Iceberg Drift Regressor loaded from {MODEL_PATH}")
        else:
            print(f"[ML WARNING] Drift model not found at {MODEL_PATH}")
    return _drift_data

def predict_drift_speed(iceberg_dict: dict, env_dict: dict) -> dict:
    reg_data = load_drift_model()
    
    defaults = {
        "wind_speed": float(env_dict.get("wind_speed_knots", env_dict.get("wind_speed", 18.0))),
        "wind_direction": 210.0 if env_dict.get("wind_direction") == "SSW" else 200.0,
        "ocean_current_speed": float(env_dict.get("ocean_current_speed", 0.4)),
        "ocean_current_direction": 45.0 if env_dict.get("ocean_current_direction") == "NE" else 45.0,
        "sea_ice_concentration": float(env_dict.get("sea_ice_concentration_avg", env_dict.get("sea_ice_concentration", 32.0))),
        "wave_height": float(env_dict.get("wave_height_meters", env_dict.get("wave_height", 1.8))),
        "temperature": float(env_dict.get("temperature_c", env_dict.get("temperature", -4.2))),
        "iceberg_size": float(iceberg_dict.get("estimated_size", iceberg_dict.get("size", 1.8))),
        "iceberg_mass_proxy": float(iceberg_dict.get("estimated_size", 1.8)) * 110.0,
        "previous_drift_speed": float(iceberg_dict.get("drift_speed", 0.38)),
        "previous_heading": float(iceberg_dict.get("drift_heading", 220.0))
    }
    
    if reg_data is not None:
        feature_names = reg_data["feature_names"]
        input_df = pd.DataFrame([defaults])[feature_names]
        reg = reg_data["model"]
        pred_speed = float(reg.predict(input_df)[0])
        pred_speed = max(0.15, min(1.50, round(pred_speed, 2)))
        
        # Heading prediction based on wind and current vectors
        curr_dir = defaults["ocean_current_direction"]
        wind_dir = defaults["wind_direction"]
        pred_heading = float((0.7 * curr_dir + 0.3 * wind_dir) % 360.0)
        
        return {
            "predicted_drift_speed": pred_speed,
            "predicted_heading": round(pred_heading, 1),
            "model": "Random Forest Regression",
            "features_used": defaults
        }
    else:
        # Physical model fallback
        curr_spd = defaults["ocean_current_speed"]
        w_spd = defaults["wind_speed"]
        spd = round(0.55 * curr_spd + 0.012 * w_spd, 2)
        return {
            "predicted_drift_speed": max(0.15, min(1.50, spd)),
            "predicted_heading": 215.0,
            "model": "Physical Drift Fallback",
            "features_used": defaults
        }
