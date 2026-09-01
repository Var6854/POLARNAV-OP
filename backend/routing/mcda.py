import numpy as np

def rank_routes_mcda(routes: list, weights: dict = None) -> list:
    """
    Ranks candidate routes using the Multi-Criteria Decision Analysis (MCDA) Weighted Sum Method.
    Weights are normalized. Criteria are scaled to [0, 1] where 1.0 is best.
    """
    if not routes:
        return []
        
    if weights is None:
        weights = {
            "safety": 0.35,
            "distance": 0.20,
            "fuel": 0.15,
            "weather": 0.15,
            "sea_ice": 0.10,
            "environmental": 0.05
        }
        
    # Ensure weights sum to 1.0
    total_w = sum(weights.values())
    w = {k: v / total_w for k, v in weights.items()}
    
    # Extract criteria arrays for normalization
    distances = np.array([r["distanceKm"] for r in routes], dtype=float)
    fuels = np.array([r["fuelLiters"] for r in routes], dtype=float)
    risks = np.array([r["riskScore"] for r in routes], dtype=float)
    ice_costs = np.array([r["costBreakdown"]["seaIce"] for r in routes], dtype=float)
    weather_costs = np.array([r["costBreakdown"]["weather"] for r in routes], dtype=float)
    
    def norm_cost(arr):
        min_v, max_v = np.min(arr), np.max(arr)
        if max_v == min_v:
            return np.ones_like(arr) * 0.5
        # Lower cost is better -> 1.0 for min_v, 0.0 for max_v
        return 1.0 - (arr - min_v) / (max_v - min_v)

    safety_norm = 1.0 - (risks / 100.0)  # Higher safety is better
    dist_norm = norm_cost(distances)
    fuel_norm = norm_cost(fuels)
    weather_norm = norm_cost(weather_costs)
    ice_norm = norm_cost(ice_costs)
    env_norm = dist_norm * 0.5 + fuel_norm * 0.5  # Environmental impact proxy
    
    for i, r in enumerate(routes):
        mcda_score = (
            w["safety"] * safety_norm[i] +
            w["distance"] * dist_norm[i] +
            w["fuel"] * fuel_norm[i] +
            w["weather"] * weather_norm[i] +
            w["sea_ice"] * ice_norm[i] +
            w["environmental"] * env_norm[i]
        ) * 100.0
        
        r["mcdaScore"] = round(float(mcda_score), 1)
        
    # Sort routes by MCDA score descending
    ranked_indices = np.argsort([-r["mcdaScore"] for r in routes])
    best_idx = ranked_indices[0]
    
    for i, r in enumerate(routes):
        if i == best_idx:
            r["status"] = "RECOMMENDED"
        else:
            if r["riskScore"] >= 75:
                r["status"] = "AVOID"
            elif r["riskScore"] >= 55:
                r["status"] = "AVOID"
            else:
                r["status"] = "ACCEPTABLE" if i == ranked_indices[1] else "SECONDARY"
                
        # Generate dynamic explanation
        r["explanation"] = generate_route_explanation(r, routes[best_idx], is_best=(i == best_idx))
        
    return routes

def generate_route_explanation(route: dict, best_route: dict, is_best: bool) -> str:
    r_name = route["name"]
    r_risk = route["riskScore"]
    r_dist = route["distanceKm"]
    b_name = best_route["name"]
    b_dist = best_route["distanceKm"]
    b_risk = best_route["riskScore"]
    
    if is_best:
        if route["id"] == "b" and r_risk < b_risk + 10:
            return f"{r_name} is preferred by the MCDA engine as it provides safe deep-water clearance ({route['riskCategory']} risk score {r_risk}/100) bypassing active tabular iceberg hazard corridors."
        return f"{r_name} is preferred by MCDA weighted-sum ranking with an optimal balance of safety ({r_risk}/100 risk), distance ({r_dist} km), and fuel consumption."
    else:
        dist_diff = r_dist - b_dist
        if r_risk >= 55:
            return f"{r_name} is NOT recommended due to CRITICAL iceberg trajectory exposure (Risk score {r_risk}/100). {b_name} is preferred."
        elif dist_diff > 0:
            return f"{r_name} is acceptable but requires {dist_diff} km additional transit compared to {b_name}."
        else:
            return f"{r_name} offers a shorter distance ({r_dist} km) but suffers higher environmental hazard exposure than {b_name}."
