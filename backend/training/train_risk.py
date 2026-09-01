import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "navigation_risk.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "risk_regressor.joblib")

def train_risk_regressor():
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = pd.read_csv(DATA_PATH)
    
    feature_cols = [
        "iceberg_distance_km",
        "iceberg_speed_ms",
        "iceberg_confidence",
        "sea_ice_concentration",
        "wind_speed",
        "visibility_km",
        "wave_height",
        "ocean_current_speed",
        "vessel_draft",
        "vessel_speed",
        "ice_capability_score",
        "submerged_hazard_distance"
    ]
    
    X = df[feature_cols]
    y = df["risk_score"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    reg = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    reg.fit(X_train, y_train)
    
    y_pred = reg.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("=== NAVIGATION RISK REGRESSOR EVALUATION ===")
    print(f"MAE:  {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R²:   {r2:.4f}")
    
    joblib.dump({"model": reg, "feature_names": feature_cols}, MODEL_PATH)
    print(f"Model successfully saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_risk_regressor()
