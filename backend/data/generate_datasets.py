import os
import numpy as np
import pandas as pd

np.random.seed(42)
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_iceberg_features(n=150):
    obs_ids = [f"OBS-{1000 + i}" for i in range(n)]
    ib_ids = [f"IB-0{np.random.randint(10, 99)}" for _ in range(n)]
    
    sar_backscatter_mean = np.random.normal(-15.0, 4.0, n).round(2)
    sar_backscatter_std = np.random.uniform(1.2, 5.5, n).round(2)
    texture_contrast = np.random.uniform(0.1, 0.95, n).round(3)
    texture_homogeneity = np.random.uniform(0.05, 0.9, n).round(3)
    object_area_km2 = np.random.exponential(1.5, n).round(2) + 0.1
    ice_edge_distance_km = np.random.uniform(2.0, 120.0, n).round(1)
    wind_speed_knots = np.random.uniform(5.0, 45.0, n).round(1)
    wind_direction_deg = np.random.uniform(0, 360, n).round(1)
    ocean_current_speed_ms = np.random.uniform(0.1, 1.2, n).round(2)
    ocean_current_direction_deg = np.random.uniform(0, 360, n).round(1)
    wave_height_m = np.random.uniform(0.5, 6.0, n).round(1)
    sea_ice_concentration = np.random.uniform(10, 95, n).round(1)
    temperature_c = np.random.uniform(-15.0, 2.0, n).round(1)
    confidence_percent = np.random.uniform(60, 98, n).round(0)
    
    drift_speed_ms = (0.55 * ocean_current_speed_ms + 0.012 * wind_speed_knots + np.random.normal(0, 0.05, n)).clip(0.1, 1.5).round(2)
    drift_heading_deg = (ocean_current_direction_deg * 0.7 + wind_direction_deg * 0.3 + np.random.normal(0, 10, n)) % 360
    drift_heading_deg = drift_heading_deg.round(1)
    
    # Define hazard class based on area, drift speed, sea ice concentration, and ice edge distance
    hazard_score = (
        0.3 * (object_area_km2 / 5.0).clip(0, 1) +
        0.3 * (drift_speed_ms / 1.2).clip(0, 1) +
        0.2 * (sea_ice_concentration / 100.0) +
        0.2 * (1.0 - (ice_edge_distance_km / 120.0))
    )
    
    hazard_class = []
    for score in hazard_score:
        if score > 0.65:
            hazard_class.append("CRITICAL")
        elif score > 0.45:
            hazard_class.append("HIGH")
        elif score > 0.25:
            hazard_class.append("MODERATE")
        else:
            hazard_class.append("LOW")
            
    df = pd.DataFrame({
        "observation_id": obs_ids,
        "iceberg_id": ib_ids,
        "sar_backscatter_mean": sar_backscatter_mean,
        "sar_backscatter_std": sar_backscatter_std,
        "texture_contrast": texture_contrast,
        "texture_homogeneity": texture_homogeneity,
        "object_area_km2": object_area_km2,
        "ice_edge_distance_km": ice_edge_distance_km,
        "wind_speed_knots": wind_speed_knots,
        "wind_direction_deg": wind_direction_deg,
        "ocean_current_speed_ms": ocean_current_speed_ms,
        "ocean_current_direction_deg": ocean_current_direction_deg,
        "wave_height_m": wave_height_m,
        "sea_ice_concentration": sea_ice_concentration,
        "temperature_c": temperature_c,
        "confidence_percent": confidence_percent,
        "drift_speed_ms": drift_speed_ms,
        "drift_heading_deg": drift_heading_deg,
        "hazard_class": hazard_class
    })
    
    df.to_csv(os.path.join(DATA_DIR, "iceberg_features.csv"), index=False)
    print(f"Generated iceberg_features.csv ({len(df)} rows)")

def generate_iceberg_drift(n=150):
    record_ids = [f"REC-{2000 + i}" for i in range(n)]
    ib_ids = [f"IB-0{np.random.randint(10, 99)}" for _ in range(n)]
    
    lats = np.random.uniform(-65.0, -61.0, n).round(4)
    lons = np.random.uniform(-62.0, -54.0, n).round(4)
    prev_lats = (lats + np.random.uniform(-0.05, 0.05, n)).round(4)
    prev_lons = (lons + np.random.uniform(-0.05, 0.05, n)).round(4)
    
    wind_speed = np.random.uniform(5.0, 45.0, n).round(1)
    wind_direction = np.random.uniform(0, 360, n).round(1)
    ocean_current_speed = np.random.uniform(0.1, 1.2, n).round(2)
    ocean_current_direction = np.random.uniform(0, 360, n).round(1)
    sea_ice_concentration = np.random.uniform(5, 95, n).round(1)
    wave_height = np.random.uniform(0.5, 6.0, n).round(1)
    temperature = np.random.uniform(-15.0, 2.0, n).round(1)
    iceberg_size = np.random.uniform(0.2, 4.5, n).round(2)
    iceberg_mass_proxy = (iceberg_size * np.random.uniform(80, 150, n)).round(1)
    
    prev_drift_speed = np.random.uniform(0.15, 0.8, n).round(2)
    prev_heading = np.random.uniform(0, 360, n).round(1)
    
    ice_drag = 1.0 - (sea_ice_concentration / 200.0)
    mass_inertia = 1.0 - (iceberg_size / 20.0).clip(0, 0.2)
    
    drift_speed = (
        (0.50 * ocean_current_speed + 0.012 * wind_speed + 0.25 * prev_drift_speed) * ice_drag * mass_inertia +
        np.random.normal(0, 0.03, n)
    ).clip(0.10, 1.40).round(2)
    
    drift_heading = ((0.6 * ocean_current_direction + 0.2 * wind_direction + 0.2 * prev_heading) + np.random.normal(0, 8, n)) % 360
    drift_heading = drift_heading.round(1)
    
    df = pd.DataFrame({
        "record_id": record_ids,
        "iceberg_id": ib_ids,
        "latitude": lats,
        "longitude": lons,
        "previous_latitude": prev_lats,
        "previous_longitude": prev_lons,
        "wind_speed": wind_speed,
        "wind_direction": wind_direction,
        "ocean_current_speed": ocean_current_speed,
        "ocean_current_direction": ocean_current_direction,
        "sea_ice_concentration": sea_ice_concentration,
        "wave_height": wave_height,
        "temperature": temperature,
        "iceberg_size": iceberg_size,
        "iceberg_mass_proxy": iceberg_mass_proxy,
        "previous_drift_speed": prev_drift_speed,
        "previous_heading": prev_heading,
        "drift_speed": drift_speed,
        "drift_heading": drift_heading
    })
    
    df.to_csv(os.path.join(DATA_DIR, "iceberg_drift.csv"), index=False)
    print(f"Generated iceberg_drift.csv ({len(df)} rows)")

def generate_navigation_risk(n=150):
    sample_ids = [f"SMP-{3000 + i}" for i in range(n)]
    
    iceberg_distance_km = np.random.uniform(0.5, 50.0, n).round(1)
    iceberg_speed_ms = np.random.uniform(0.1, 1.2, n).round(2)
    iceberg_confidence = np.random.uniform(50, 99, n).round(0)
    sea_ice_concentration = np.random.uniform(5, 95, n).round(1)
    wind_speed = np.random.uniform(5, 45, n).round(1)
    visibility_km = np.random.uniform(0.5, 20.0, n).round(1)
    wave_height = np.random.uniform(0.5, 6.0, n).round(1)
    ocean_current_speed = np.random.uniform(0.1, 1.2, n).round(2)
    vessel_draft = np.random.uniform(5.0, 12.0, n).round(1)
    vessel_speed = np.random.uniform(8.0, 18.0, n).round(1)
    ice_capability_score = np.random.choice([0.4, 0.6, 0.8, 1.0], n)
    submerged_hazard_distance = np.random.uniform(0.2, 30.0, n).round(1)
    
    dist_risk = (1.0 - (iceberg_distance_km / 35.0).clip(0, 1)) * 35.0
    ice_risk = (sea_ice_concentration / 100.0) * 25.0
    weather_risk = (wind_speed / 45.0 + (20.0 - visibility_km) / 20.0 + wave_height / 6.0) / 3.0 * 20.0
    vessel_factor = (vessel_draft / 12.0) * (1.2 - ice_capability_score) * 20.0
    
    raw_risk = dist_risk + ice_risk + weather_risk + vessel_factor + np.random.normal(0, 2.5, n)
    risk_score = raw_risk.clip(5, 98).round(1)
    
    risk_category = []
    for score in risk_score:
        if score >= 75:
            risk_category.append("CRITICAL")
        elif score >= 55:
            risk_category.append("HIGH")
        elif score >= 35:
            risk_category.append("MODERATE")
        else:
            risk_category.append("LOW")
            
    df = pd.DataFrame({
        "sample_id": sample_ids,
        "iceberg_distance_km": iceberg_distance_km,
        "iceberg_speed_ms": iceberg_speed_ms,
        "iceberg_confidence": iceberg_confidence,
        "sea_ice_concentration": sea_ice_concentration,
        "wind_speed": wind_speed,
        "visibility_km": visibility_km,
        "wave_height": wave_height,
        "ocean_current_speed": ocean_current_speed,
        "vessel_draft": vessel_draft,
        "vessel_speed": vessel_speed,
        "ice_capability_score": ice_capability_score,
        "submerged_hazard_distance": submerged_hazard_distance,
        "risk_score": risk_score,
        "risk_category": risk_category
    })
    
    df.to_csv(os.path.join(DATA_DIR, "navigation_risk.csv"), index=False)
    print(f"Generated navigation_risk.csv ({len(df)} rows)")

def generate_sea_ice(n=150):
    record_ids = [f"ICE-{4000 + i}" for i in range(n)]
    lats = np.random.uniform(-65.0, -61.0, n).round(4)
    lons = np.random.uniform(-62.0, -54.0, n).round(4)
    date_indices = np.random.randint(1, 30, n)
    
    sea_ice_concentration = np.random.uniform(5, 95, n).round(1)
    temperature = np.random.uniform(-18.0, 1.5, n).round(1)
    wind_speed = np.random.uniform(5, 45, n).round(1)
    wind_direction = np.random.uniform(0, 360, n).round(1)
    ocean_current_speed = np.random.uniform(0.1, 1.2, n).round(2)
    wave_height = np.random.uniform(0.5, 5.5, n).round(1)
    ice_drift_speed = (0.02 * wind_speed + 0.6 * ocean_current_speed).round(2)
    ice_edge_distance = np.random.uniform(1.0, 150.0, n).round(1)
    
    df = pd.DataFrame({
        "record_id": record_ids,
        "latitude": lats,
        "longitude": lons,
        "date_index": date_indices,
        "sea_ice_concentration": sea_ice_concentration,
        "temperature": temperature,
        "wind_speed": wind_speed,
        "wind_direction": wind_direction,
        "ocean_current_speed": ocean_current_speed,
        "wave_height": wave_height,
        "ice_drift_speed": ice_drift_speed,
        "ice_edge_distance": ice_edge_distance
    })
    
    df.to_csv(os.path.join(DATA_DIR, "sea_ice.csv"), index=False)
    print(f"Generated sea_ice.csv ({len(df)} rows)")

if __name__ == "__main__":
    generate_iceberg_features()
    generate_iceberg_drift()
    generate_navigation_risk()
    generate_sea_ice()
