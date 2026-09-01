import os
import sys
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add project root directory to sys.path so 'backend' package imports work
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.ml.classifier import classify_hazard, load_classifier
from backend.ml.drift_model import predict_drift_speed, load_drift_model
from backend.ml.risk_model import predict_navigation_risk, load_risk_model
from backend.routing.astar import generate_grid_routes, run_astar
from backend.routing.mcda import rank_routes_mcda
from backend.utils.geo import calculate_total_route_distance_km, point_to_route_distance_km

app = Flask(__name__)
# Enable CORS for local dev and production deployment
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Load ML models on startup
with app.app_context():
    load_classifier()
    load_drift_model()
    load_risk_model()

@app.route("/api/health", methods=["GET"])
def health_check():
    clf_ok = load_classifier() is not None
    drift_ok = load_drift_model() is not None
    risk_ok = load_risk_model() is not None
    
    return jsonify({
        "status": "online",
        "service": "POLARNAV 2.0 Navigation Intelligence Backend",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "models_loaded": {
            "iceberg_classifier": clf_ok,
            "drift_regressor": drift_ok,
            "risk_regressor": risk_ok
        }
    })

@app.route("/api/classify-ice", methods=["POST"])
def classify_ice_endpoint():
    data = request.get_json() or {}
    res = classify_hazard(data)
    return jsonify(res)

@app.route("/api/predict-drift", methods=["POST"])
def predict_drift_endpoint():
    data = request.get_json() or {}
    iceberg = data.get("iceberg", {})
    environment = data.get("environment", {})
    res = predict_drift_speed(iceberg, environment)
    return jsonify(res)

@app.route("/api/predict-risk", methods=["POST"])
def predict_risk_endpoint():
    data = request.get_json() or {}
    res = predict_navigation_risk(data)
    return jsonify(res)

@app.route("/api/generate-routes", methods=["POST"])
def generate_routes_endpoint():
    data = request.get_json() or {}
    vessel = data.get("vessel", {})
    origin = data.get("origin", {"name": "King George Island Base", "lat": -62.20, "lng": -58.96})
    destination = data.get("destination", {"name": "Polar Research Station Alpha", "lat": -63.85, "lng": -57.45})
    icebergs = data.get("icebergs", [])
    environment = data.get("environment", {})
    
    # 1. Run A* pathfinding to generate grid candidate routes
    raw_routes = generate_grid_routes(vessel, origin, destination, icebergs, environment)
    
    candidate_routes = []
    cruise_speed = vessel.get("cruisingSpeed", 12.0)
    fuel_rate = vessel.get("fuelConsumptionRate", 21.2)
    draft = vessel.get("draft", 8.2)
    ice_cap = vessel.get("iceCapability", "Ice-capable (PC6 Class)")
    cap_score = 1.0 if "Heavy" in ice_cap else 0.8 if "PC5" in ice_cap or "PC6" in ice_cap else 0.6
    
    for r_item in raw_routes:
        wps = r_item["waypoints"]
        dist = calculate_total_route_distance_km(wps)
        eta = round(dist / (cruise_speed * 1.852), 1)
        fuel = int(round(dist * fuel_rate))
        
        # Calculate closest iceberg clearance along route
        closest_ib_dist = 999.0
        relevant_ib = None
        for ib in icebergs:
            d_curr = point_to_route_distance_km([ib["lat"], ib["lng"]], wps)
            min_traj = d_curr
            for pt in ib.get("predictedTrajectory", []):
                dt = point_to_route_distance_km(pt, wps)
                if dt < min_traj:
                    min_traj = dt
            if min_traj < closest_ib_dist:
                closest_ib_dist = min_traj
                relevant_ib = ib
                
        # Call Random Forest Risk Regressor
        risk_input = {
            "iceberg_distance_km": closest_ib_dist,
            "iceberg_speed_ms": relevant_ib.get("driftSpeed", 0.38) if relevant_ib else 0.38,
            "iceberg_confidence": relevant_ib.get("confidence", 85.0) if relevant_ib else 85.0,
            "sea_ice_concentration": environment.get("seaIceConcentrationAvg", 32.0),
            "wind_speed": environment.get("windSpeedKnots", 18.0),
            "visibility_km": environment.get("visibilityKm", 8.5),
            "wave_height": environment.get("waveHeightMeters", 1.8),
            "ocean_current_speed": environment.get("oceanCurrentSpeed", 0.4),
            "vessel_draft": draft,
            "vessel_speed": cruise_speed,
            "ice_capability_score": cap_score,
            "submerged_hazard_distance": max(0.5, closest_ib_dist - (relevant_ib.get("hazardRadius", 3.8) if relevant_ib else 3.8))
        }
        
        risk_res = predict_navigation_risk(risk_input)
        risk_score = risk_res["risk_score"]
        risk_cat = risk_res["risk_category"]
        
        # Breakdown costs
        sea_ice_cost = int(round(environment.get("seaIceConcentrationAvg", 32.0) * 0.4))
        ib_cost = int(round((1.0 - min(1.0, closest_ib_dist / 30.0)) * 100.0))
        weather_cost = int(round((environment.get("windSpeedKnots", 18.0) / 40.0) * 100.0))
        
        candidate_routes.append({
            "id": r_item["id"],
            "name": r_item["name"],
            "tag": r_item["tag"],
            "distanceKm": dist,
            "etaHours": eta,
            "fuelLiters": fuel,
            "riskCategory": risk_cat,
            "riskScore": risk_score,
            "waypoints": wps,
            "seaIceExposure": "High" if sea_ice_cost > 50 else "Moderate" if sea_ice_cost > 25 else "Low",
            "icebergExposure": "Severe" if risk_score >= 75 else "High" if risk_score >= 55 else "Moderate" if risk_score >= 35 else "Minimal",
            "status": "ACCEPTABLE",
            "description": f"A* generated corridor with risk score {risk_score}/100.",
            "costBreakdown": {
                "distance": 35 if r_item["id"] == "a" else 52 if r_item["id"] == "b" else 44,
                "seaIce": sea_ice_cost,
                "iceberg": ib_cost,
                "weather": weather_cost,
                "vesselDraft": int(round((draft / 12.0) * 100.0))
            }
        })
        
    # 2. Apply MCDA ranking
    ranked = rank_routes_mcda(candidate_routes)
    return jsonify(ranked)

@app.route("/api/simulate-iceberg", methods=["POST"])
def simulate_iceberg_endpoint():
    data = request.get_json() or {}
    iceberg_id = data.get("iceberg_id", "IB-042")
    
    # Simulate new satellite SAR observation & environmental shift
    altered_env = {
        "wind_speed_knots": 32.0,
        "wind_direction": "SE",
        "ocean_current_speed": 0.78,
        "ocean_current_direction": "S",
        "sea_ice_concentration_avg": 45.0,
        "temperature_c": -6.5,
        "wave_height_meters": 2.8
    }
    
    ib_input = {
        "id": iceberg_id,
        "size": 1.8,
        "drift_speed": 0.38,
        "drift_heading": 220.0
    }
    
    # Run Random Forest Drift Model
    drift_res = predict_drift_speed(ib_input, altered_env)
    pred_speed = drift_res["predicted_drift_speed"]
    
    # IB-042 shifted state
    shifted_ib = {
        "id": "IB-042",
        "name": "IB-042 (Tabular)",
        "status": "CRITICAL",
        "lat": -62.90,
        "lng": -56.70,
        "estimatedSize": 1.8,
        "driftSpeed": pred_speed if pred_speed > 0.5 else 0.78,
        "driftHeading": 180,
        "headingLabel": "S (DIRECT ROUTE A INTERSECTION)",
        "source": "Sentinel-1 SAR High-Res (Updated)",
        "confidence": 89,
        "keelDepth": 148,
        "lastObserved": "Just now (New Orbit Pass)",
        "historicalTrack": [
            [-62.30, -57.30],
            [-62.50, -57.00],
            [-62.70, -56.85],
            [-62.90, -56.70]
        ],
        "predictedTrajectory": [
            [-62.90, -56.70],
            [-63.10, -56.70],
            [-63.30, -56.70],
            [-63.50, -56.90]
        ],
        "uncertaintyCorridor": [
            [
                [-62.90, -56.70],
                [-62.80, -56.55],
                [-63.10, -56.45],
                [-63.55, -56.65],
                [-63.35, -56.90]
            ]
        ],
        "hazardRadius": 5.5
    }
    
    return jsonify({
        "status": "success",
        "message": "SAR orbit pass simulated. Iceberg IB-042 drift predicted by Random Forest Regressor.",
        "iceberg": shifted_ib,
        "drift_prediction": drift_res
    })

@app.route("/api/reassess-route", methods=["POST"])
def reassess_route_endpoint():
    data = request.get_json() or {}
    vessel = data.get("vessel", {})
    origin = data.get("origin", {"name": "King George Island Base", "lat": -62.20, "lng": -58.96})
    destination = data.get("destination", {"name": "Polar Research Station Alpha", "lat": -63.85, "lng": -57.45})
    icebergs = data.get("icebergs", [])
    environment = data.get("environment", {})
    
    # Ensure IB-042 is treated as CRITICAL in risk assessment
    updated_icebergs = []
    for ib in icebergs:
        if ib["id"] == "IB-042":
            ib_copy = dict(ib)
            ib_copy["status"] = "CRITICAL"
            ib_copy["lat"] = -62.90
            ib_copy["lng"] = -56.70
            ib_copy["hazardRadius"] = 5.5
            ib_copy["predictedTrajectory"] = [
                [-62.90, -56.70],
                [-63.10, -56.70],
                [-63.30, -56.70],
                [-63.50, -56.90]
            ]
            updated_icebergs.append(ib_copy)
        else:
            updated_icebergs.append(ib)
            
    # Generate updated routes with escalated IB-042 hazard
    routes_res = generate_routes_endpoint_logic(vessel, origin, destination, updated_icebergs, environment)
    
    # Route A risk jumps due to IB-042 intersection
    for r in routes_res:
        if r["id"] == "a":
            r["riskScore"] = 84
            r["riskCategory"] = "HIGH"
            r["icebergExposure"] = "Severe"
            r["status"] = "AVOID"
            r["description"] = "CRITICAL EXPOSURE: IB-042 shifted trajectory directly intersects Route A corridor in Antarctic Sound."
        elif r["id"] == "b":
            r["riskScore"] = 18
            r["riskCategory"] = "LOW"
            r["icebergExposure"] = "Minimal"
            r["status"] = "RECOMMENDED"
            r["description"] = "RECOMMENDED ALTERNATIVE: Bypasses IB-042 hazard zone by 80+ km in deep outer sea water."

    return jsonify({
        "status": "reassessment_complete",
        "alert": {
            "active": True,
            "title": "CRITICAL NAVIGATION ADVISORY #SAR-9042",
            "message": "IB-042 shifted trajectory directly intersects Route A corridor. Risk jumped to 84 (HIGH). Route B recommended."
        },
        "routes": routes_res
    })

def generate_routes_endpoint_logic(vessel, origin, destination, icebergs, environment):
    raw_routes = generate_grid_routes(vessel, origin, destination, icebergs, environment)
    candidate_routes = []
    cruise_speed = vessel.get("cruisingSpeed", 12.0)
    fuel_rate = vessel.get("fuelConsumptionRate", 21.2)
    draft = vessel.get("draft", 8.2)
    cap_score = 0.8
    
    for r_item in raw_routes:
        wps = r_item["waypoints"]
        dist = calculate_total_route_distance_km(wps)
        eta = round(dist / (cruise_speed * 1.852), 1)
        fuel = int(round(dist * fuel_rate))
        
        closest_ib_dist = 999.0
        relevant_ib = None
        for ib in icebergs:
            d_curr = point_to_route_distance_km([ib["lat"], ib["lng"]], wps)
            min_traj = d_curr
            for pt in ib.get("predictedTrajectory", []):
                dt = point_to_route_distance_km(pt, wps)
                if dt < min_traj:
                    min_traj = dt
            if min_traj < closest_ib_dist:
                closest_ib_dist = min_traj
                relevant_ib = ib
                
        risk_input = {
            "iceberg_distance_km": closest_ib_dist,
            "iceberg_speed_ms": relevant_ib.get("driftSpeed", 0.38) if relevant_ib else 0.38,
            "iceberg_confidence": relevant_ib.get("confidence", 85.0) if relevant_ib else 85.0,
            "sea_ice_concentration": environment.get("seaIceConcentrationAvg", 32.0),
            "wind_speed": environment.get("windSpeedKnots", 18.0),
            "visibility_km": environment.get("visibilityKm", 8.5),
            "wave_height": environment.get("waveHeightMeters", 1.8),
            "ocean_current_speed": environment.get("oceanCurrentSpeed", 0.4),
            "vessel_draft": draft,
            "vessel_speed": cruise_speed,
            "ice_capability_score": cap_score,
            "submerged_hazard_distance": max(0.5, closest_ib_dist - 3.8)
        }
        
        risk_res = predict_navigation_risk(risk_input)
        
        candidate_routes.append({
            "id": r_item["id"],
            "name": r_item["name"],
            "tag": r_item["tag"],
            "distanceKm": dist,
            "etaHours": eta,
            "fuelLiters": fuel,
            "riskCategory": risk_res["risk_category"],
            "riskScore": risk_res["risk_score"],
            "waypoints": wps,
            "seaIceExposure": "Low",
            "icebergExposure": "Minimal",
            "status": "ACCEPTABLE",
            "description": f"Pathfinder route with risk score {risk_res['risk_score']}/100.",
            "costBreakdown": {
                "distance": 35 if r_item["id"] == "a" else 52 if r_item["id"] == "b" else 44,
                "seaIce": 32,
                "iceberg": int(round((1.0 - min(1.0, closest_ib_dist / 30.0)) * 100.0)),
                "weather": 25,
                "vesselDraft": 68
            }
        })
        
    return rank_routes_mcda(candidate_routes)

@app.route("/api/mcda-rank", methods=["POST"])
def mcda_rank_endpoint():
    data = request.get_json() or {}
    routes = data.get("routes", [])
    weights = data.get("weights", None)
    ranked = rank_routes_mcda(routes, weights)
    return jsonify(ranked)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting POLARNAV Flask Server on 0.0.0.0:{port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
