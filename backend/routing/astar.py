import heapq
import math
import os
import json
from backend.utils.geo import haversine_distance_km, interpolate_waypoints, calculate_total_route_distance_km
from backend.ml.risk_model import predict_navigation_risk

# Antarctic Peninsula Grid Parameters
LAT_MIN = -66.0
LAT_MAX = -61.0
LON_MIN = -62.0
LON_MAX = -54.0
GRID_RES = 0.04  # ~4.4 km SAR grid resolution

# Load Synthetic Sentinel-1 SAR & Bathymetry Grid Dataset
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
SAR_JSON_PATH = os.path.join(DATA_DIR, "antarctic_sar_grid.json")

SAR_GRID = {}
if os.path.exists(SAR_JSON_PATH):
    try:
        with open(SAR_JSON_PATH, "r", encoding="utf-8") as f:
            sar_data = json.load(f)
            SAR_GRID = sar_data.get("grid", {})
            print(f"[SAR DATASET] Loaded {len(SAR_GRID)} high-resolution SAR nodes from antarctic_sar_grid.json")
    except Exception as e:
        print(f"[SAR DATASET] Error loading SAR dataset: {e}")

def get_sar_node(lat: float, lon: float) -> dict:
    """Finds nearest spatial node in the SAR dataset grid."""
    grid_lat = round(round((lat - LAT_MIN) / GRID_RES) * GRID_RES + LAT_MIN, 3)
    grid_lon = round(round((lon - LON_MIN) / GRID_RES) * GRID_RES + LON_MIN, 3)
    key = f"{grid_lat:.3f}_{grid_lon:.3f}"
    return SAR_GRID.get(key, {})

def latlon_to_grid(lat: float, lon: float) -> tuple:
    r = int(round((lat - LAT_MIN) / GRID_RES))
    c = int(round((lon - LON_MIN) / GRID_RES))
    return (r, c)

def grid_to_latlon(r: int, c: int) -> tuple:
    lat = round(LAT_MIN + r * GRID_RES, 4)
    lon = round(LON_MIN + c * GRID_RES, 4)
    return (lat, lon)

def is_land(lat: float, lon: float) -> bool:
    """Query high-resolution SAR dataset land mask."""
    sar_node = get_sar_node(lat, lon)
    if sar_node:
        return sar_node.get("is_land", False)
        
    # Geometric fallback land mask
    if -64.30 <= lat <= -63.10 and -59.50 <= lon <= -57.10:
        return True
    if -63.45 <= lat <= -63.15 and -56.30 <= lon <= -55.30:
        return True
    if -65.5 <= lat <= -64.3 and -64.0 <= lon <= -58.2:
        return True
    return False

def calculate_cell_cost(lat: float, lon: float, icebergs: list, environment: dict, vessel: dict) -> float:
    if is_land(lat, lon):
        return float('inf')  # BLOCKED LAND OBSTACLE
        
    base_cost = 1.0
    sar_node = get_sar_node(lat, lon)
    
    # 1. SAR Sea Ice & Backscatter Cost
    sea_ice_avg = environment.get("sea_ice_concentration_avg", 32.0)
    if sar_node:
        ice_conc = sar_node.get("sea_ice_concentration_pct", sea_ice_avg)
        sar_db = sar_node.get("sar_backscatter_db", -20.0)
        # Higher SAR backscatter indicates bright rough ice pack
        sar_roughness_cost = max(0.0, (sar_db - (-18.0)) * 0.5) if sar_db > -18.0 else 0.0
    else:
        ice_conc = sea_ice_avg
        sar_roughness_cost = 0.0

    sea_ice_cost = (ice_conc / 100.0) * 8.0 + sar_roughness_cost
    
    # 2. Iceberg Hazard Cost
    iceberg_cost = 0.0
    for ib in icebergs:
        ib_lat = ib.get("lat", -63.5)
        ib_lon = ib.get("lng", -59.6)
        radius = ib.get("hazardRadius", 3.8)
        status = ib.get("status", "MONITORED")
        
        dist_to_ib = haversine_distance_km(lat, lon, ib_lat, ib_lon)
        
        if dist_to_ib <= radius:
            mult = 50.0 if status in ["CRITICAL", "WATCH"] else 20.0
            iceberg_cost += mult * (1.0 - dist_to_ib / (radius + 0.1))
            
        traj = ib.get("predictedTrajectory", [])
        for pt in traj:
            dist_to_traj = haversine_distance_km(lat, lon, pt[0], pt[1])
            if dist_to_traj <= radius:
                mult = 60.0 if status == "CRITICAL" else 15.0
                iceberg_cost += mult * (1.0 - dist_to_traj / (radius + 0.1))

    # 3. Weather & Ocean Current Cost
    wind_speed = environment.get("wind_speed_knots", 18.0)
    current_speed = environment.get("ocean_current_speed", 0.4)
    weather_cost = (wind_speed / 40.0) * 2.0 + (current_speed / 2.0) * 1.5
    
    # 4. Bathymetric Keel Clearance & Vessel Constraint
    draft = vessel.get("draft", 8.2) if vessel else 8.2
    bathymetry_depth = sar_node.get("bathymetry_depth_m", 500.0) if sar_node else 500.0
    
    # Keel depth clearance penalty if depth < 100m
    if bathymetry_depth < draft + 15.0:
        bathymetry_penalty = 15.0
    else:
        bathymetry_penalty = 0.0

    draft_cost = (draft / 12.0) * 1.5 + bathymetry_penalty
    
    return float(base_cost + sea_ice_cost + iceberg_cost + weather_cost + draft_cost)

def run_astar(start_pt: tuple, end_pt: tuple, icebergs: list, environment: dict, vessel: dict, bias_corridor: str = None) -> list:
    start_grid = latlon_to_grid(start_pt[0], start_pt[1])
    end_grid = latlon_to_grid(end_pt[0], end_pt[1])
    
    open_set = []
    heapq.heappush(open_set, (0.0, start_grid))
    
    came_from = {}
    g_score = {start_grid: 0.0}
    
    def heuristic(grid_pos):
        lat, lon = grid_to_latlon(grid_pos[0], grid_pos[1])
        h_dist = haversine_distance_km(lat, lon, end_pt[0], end_pt[1])
        if bias_corridor == "east":
            h_dist += max(0, (-56.5 - lon) * 15.0)
        elif bias_corridor == "west":
            h_dist += max(0, (lon - (-59.5)) * 15.0)
        return h_dist

    neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]
    
    iterations = 0
    max_iterations = 400
    
    while open_set and iterations < max_iterations:
        iterations += 1
        current_f, current = heapq.heappop(open_set)
        
        if current == end_grid or haversine_distance_km(*grid_to_latlon(current[0], current[1]), end_pt[0], end_pt[1]) < 8.0:
            path = []
            curr = current
            while curr in came_from:
                path.append(grid_to_latlon(curr[0], curr[1]))
                curr = came_from[curr]
            path.append(start_pt)
            path.reverse()
            path.append(end_pt)
            return path
            
        for dr, dc in neighbors:
            neighbor = (current[0] + dr, current[1] + dc)
            n_lat, n_lon = grid_to_latlon(neighbor[0], neighbor[1])
            
            if not (LAT_MIN <= n_lat <= LAT_MAX and LON_MIN <= n_lon <= LON_MAX):
                continue
                
            cell_cost = calculate_cell_cost(n_lat, n_lon, icebergs, environment, vessel)
            if cell_cost == float('inf'):
                continue
                
            step_dist = haversine_distance_km(*grid_to_latlon(current[0], current[1]), n_lat, n_lon)
            tentative_g = g_score[current] + step_dist * cell_cost
            
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + heuristic(neighbor)
                heapq.heappush(open_set, (f_score, neighbor))
                
    return []

def generate_grid_routes(vessel: dict, origin: dict, destination: dict, icebergs: list, environment: dict) -> list:
    start_pt = (origin["lat"], origin["lng"])
    end_pt = (destination["lat"], destination["lng"])
    
    # ROUTE A — Shortest Direct Ocean Channel (Antarctic Sound)
    control_a = [
        start_pt,
        [-62.45, -57.80],
        [-62.80, -56.40],
        [-63.40, -56.30],
        end_pt
    ]
    path_a = interpolate_waypoints(control_a, 2)

    # ROUTE B — Safer Outer Eastern Deep Ocean Arc
    control_b = [
        start_pt,
        [-62.30, -56.20],
        [-62.80, -54.80],
        [-63.50, -55.40],
        end_pt
    ]
    path_b = interpolate_waypoints(control_b, 2)

    # ROUTE C — Western Outer Shelf Passage
    control_c = [
        start_pt,
        [-62.60, -60.20],
        [-63.50, -61.20],
        [-64.40, -59.50],
        end_pt
    ]
    path_c = interpolate_waypoints(control_c, 2)
        
    return [
        {"id": "a", "name": "ROUTE A — SHORTEST", "tag": "Antarctic Sound Ocean Corridor", "waypoints": path_a},
        {"id": "b", "name": "ROUTE B — SAFER", "tag": "Outer Eastern Deep Ocean Bypass", "waypoints": path_b},
        {"id": "c", "name": "ROUTE C — BALANCED", "tag": "Western Outer Shelf Passage", "waypoints": path_c}
    ]
