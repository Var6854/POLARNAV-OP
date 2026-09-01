import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "iceberg_drift.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "drift_regressor.joblib")

def train_drift_regressor():
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = pd.read_csv(DATA_PATH)
    
    feature_cols = [
        "wind_speed",
        "wind_direction",
        "ocean_current_speed",
        "ocean_current_direction",
        "sea_ice_concentration",
        "wave_height",
        "temperature",
        "iceberg_size",
        "iceberg_mass_proxy",
        "previous_drift_speed",
        "previous_heading"
    ]
    
    X = df[feature_cols]
    y = df["drift_speed"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    reg = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    reg.fit(X_train, y_train)
    
    y_pred = reg.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("=== ICEBERG DRIFT REGRESSOR EVALUATION ===")
    print(f"MAE:  {mae:.4f} m/s")
    print(f"RMSE: {rmse:.4f} m/s")
    print(f"R²:   {r2:.4f}")
    
    joblib.dump({"model": reg, "feature_names": feature_cols}, MODEL_PATH)
    print(f"Model successfully saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_drift_regressor()
