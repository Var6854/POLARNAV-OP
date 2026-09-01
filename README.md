# POLARNAV 2.0 — Antarctic Maritime Navigation & Intelligence System

POLARNAV 2.0 is a decision-support platform designed for polar maritime navigation. It combines a React + Leaflet GIS frontend with a Python + Flask intelligence backend powered by `scikit-learn` Random Forest models, grid-based A* pathfinding, and Multi-Criteria Decision Analysis (MCDA).

---

## Architecture

```text
React + Tailwind + Leaflet (Vercel Frontend)
        │
        │ REST API Calls (HTTPS / JSON)
        ▼
Python + Flask Backend (Render Web Service)
        │
        ├── Random Forest Classifier (Iceberg Hazard Class)
        ├── Random Forest Regressor (Iceberg Drift Speed)
        ├── Random Forest Regressor (Estimated Navigation Risk Score)
        ├── A* Pathfinding (Grid-based Navigation with Antarctic Land & Iceberg Hazard Costs)
        └── MCDA Route Ranking (Weighted Sum Method)
        │
        ▼
     JSON API Responses
```

---

## Machine Learning Models (`scikit-learn`)

The system trains and loads three scikit-learn models using `joblib`:

1. **Iceberg Hazard Classifier (`RandomForestClassifier`)**
   - **File**: `backend/models/iceberg_classifier.joblib`
   - **Target**: `hazard_class` (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`)
   - **Features**: SAR backscatter mean/std, texture contrast, texture homogeneity, object area, ice edge distance, wind speed, current speed, wave height, sea ice concentration.

2. **Iceberg Drift Speed Regressor (`RandomForestRegressor`)**
   - **File**: `backend/models/drift_regressor.joblib`
   - **Target**: `drift_speed` (m/s)
   - **Features**: Wind speed/direction, ocean current speed/direction, sea-ice concentration, wave height, temperature, iceberg size, mass proxy, previous drift speed/heading.

3. **Navigation Risk Regressor (`RandomForestRegressor`)**
   - **File**: `backend/models/risk_regressor.joblib`
   - **Target**: `risk_score` (0–100 score)
   - **Output Category**: `LOW` (<35), `MODERATE` (35–54), `HIGH` (55–74), `CRITICAL` (75–100).
   - **Features**: Iceberg distance, drift speed, confidence, sea-ice concentration, wind speed, visibility, wave height, vessel draft, vessel speed, ice capability score, submerged hazard clearance.

---

## Navigation & Pathfinding

- **Grid-Based A* Pathfinding (`backend/routing/astar.py`)**
  - Operates on a geographic grid covering the Antarctic Peninsula region (Lat -66.0°S to -61.0°S, Lon -62.0°W to -54.0°W).
  - Uses `f(n) = g(n) + h(n)` with Haversine distance heuristic.
  - Cell cost calculation:
    `cell_cost = distance_cost + sea_ice_cost + iceberg_cost + weather_cost + ocean_cost + vessel_draft_cost`
- **Land Obstacles**: Antarctic continental land mass is masked as `BLOCKED` (non-navigable).
- **Dynamic Iceberg Hazard Cells**: Dynamic cost buffers added around iceberg coordinates, predicted trajectories, and uncertainty corridors.

---

## Multi-Criteria Decision Analysis (MCDA)

- **Weighted Sum Method (`backend/routing/mcda.py`)**
  - Normalizes candidate route criteria to [0, 1] where 1.0 is optimal.
  - Criteria weights:
    - **Safety**: 35%
    - **Distance**: 20%
    - **Fuel Consumption**: 15%
    - **Weather Exposure**: 15%
    - **Sea Ice Concentration**: 10%
    - **Environmental Impact**: 5%
  - Scores candidate routes and marks the route with the highest MCDA score as `RECOMMENDED`.
  - Generates dynamic, data-driven route explanations comparing metric deltas.

---

## Datasets Disclosures

> [!NOTE]
> **Synthetic / Demonstration Datasets**
> The datasets in `backend/data/` (`iceberg_features.csv`, `iceberg_drift.csv`, `navigation_risk.csv`, `sea_ice.csv`) contain synthetic observations representing features extracted from SAR/environmental data. They do not feed raw Sentinel-1 binary satellite rasters directly into scikit-learn models.

---

## Local Development Setup

### Backend (Python + Flask)
```bash
# 1. Generate synthetic datasets & train ML models
py backend/data/generate_datasets.py
py backend/training/train_classifier.py
py backend/training/train_drift.py
py backend/training/train_risk.py

# 2. Start Flask REST API server
py backend/app.py
```
Backend runs on `http://localhost:5000`.

### Frontend (React + Vite)
```bash
# Install dependencies & run development server
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## Deployment Configuration

- **Frontend → Vercel**: Uses `vercel.json` rewrite configuration and `VITE_API_URL` environment variable.
- **Backend → Render**: Web Service using `backend/requirements.txt` and `gunicorn backend.app:app` binding to `0.0.0.0:$PORT`.
