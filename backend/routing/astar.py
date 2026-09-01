import heapq
import math
from backend.utils.geo import haversine_distance_km, interpolate_waypoints, calculate_total_route_distance_km
from backend.ml.risk_model import predict_navigation_risk

# Antarctic Peninsula Grid Parameters
LAT_MIN = -66.0
LAT_MAX = -61.0
LON_MIN = -62.0
LON_MAX = -54.0
GRID_RES = 0.05  # ~5.5 km grid cell resolution

def latlon_to_grid(lat: float, lon: float) -> tuple:
    r = int(round((lat - LAT_MIN) / GRID_RES))
    c = int(round((lon - LON_MIN) / GRID_RES))
    return (r, c)

def grid_to_latlon(r: int, c: int) -> tuple:
    lat = round(LAT_MIN + r * GRID_RES, 4)
    lon = round(LON_MIN + c * GRID_RES, 4)
    return (lat, lon)

def is_land(lat: float, lon: float) -> bool:
    # Main Antarctic Peninsula land mass mask
    if -64.30 <= lat <= -63.10 and -59.50 <= lon <= -57.10:
        return True
    # Coastal continental shelf extension
    if -65.5 <= lat <= -64.3 and -64.0 <= lon <= -58.5:
        return True
    return False

def calculate_cell_cost(lat: float, lon: float, icebergs: list, environment: dict, vessel: dict) -> float:
    if is_land(lat, lon):
        return float('inf')  # BLOCKED
        
    base_cost = 1.0  # Open ocean base movement cost
    
    # 1. Sea Ice Cost
    sea_ice_avg = environment.get("sea_ice_concentration_avg", 32.0)
    # Heavy ice zone in SE quadrant
    if -65.2 <= lat <= -64.1 and -58.2 <= lon <= -55.6:
        ice_conc = 82.0
    elif -64.4 <= lat <= -63.4 and -59.5 <= lon <= -57.8:
        ice_conc = 45.0
    else:
        ice_conc = sea_ice_avg
    sea_ice_cost = (ice_conc / 100.0) * 8.0
    
    # 2. Iceberg Hazard Cost
    iceberg_cost = 0.0
    for ib in icebergs:
        ib_lat = ib.get("lat", -63.5)
        ib_lon = ib.get("lng", -59.6)
        radius = ib.get("hazardRadius", 3.8)
        status = ib.get("status", "MONITORED")
        
        dist_to_ib = haversine_distance_km(lat, lon, ib_lat, ib_lon)
        
        # Check current position
        if dist_to_ib <= radius:
            mult = 50.0 if status in ["CRITICAL", "WATCH"] else 20.0
            iceberg_cost += mult * (1.0 - dist_to_ib / (radius + 0.1))
            
        # Check predicted trajectory
        traj = ib.get("predictedTrajectory", [])
        for pt in traj:
            dist_to_traj = haversine_distance_km(lat, lon, pt[0], pt[1])
            if dist_to_traj <= radius:
                mult = 60.0 if status == "CRITICAL" else 15.0
                iceberg_cost += mult * (1.0 - dist_to_traj / (radius + 0.1))

    # 3. Weather & Ocean Cost
    wind_speed = environment.get("wind_speed_knots", 18.0)
    current_speed = environment.get("ocean_current_speed", 0.4)
    weather_cost = (wind_speed / 40.0) * 2.0 + (current_speed / 2.0) * 1.5
    
    # 4. Vessel Constraint Cost
    draft = vessel.get("draft", 8.2)
    draft_cost = (draft / 12.0) * 1.5
    
    total_cost = base_cost + sea_ice_cost + iceberg_cost + weather_cost + draft_cost
    return float(total_cost)

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
        
        # Add bias for generating distinct candidate corridors
        if bias_corridor == "east":
            # Encourage easting bypass
            h_dist += max(0, (-57.0 - lon) * 15.0)
        elif bias_corridor == "west":
            # Encourage westing corridor
            h_dist += max(0, (lon - (-59.0)) * 15.0)
        return h_dist

    # 8-neighbor movement vectors
    neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]
    
    iterations = 0
    max_iterations = 4000
    
    while open_set and iterations < max_iterations:
        iterations += 1
        current_f, current = heapq.heappop(open_set)
        
        if current == end_grid or haversine_distance_km(*grid_to_latlon(current[0], current[1]), end_pt[0], end_pt[1]) < 8.0:
            # Path found! Reconstruct
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
                continue  # Land obstacle
                
            step_dist = haversine_distance_km(*grid_to_latlon(current[0], current[1]), n_lat, n_lon)
            tentative_g = g_score[current] + step_dist * cell_cost
            
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + heuristic(neighbor)
                heapq.heappush(open_set, (f_score, neighbor))
                
    # Fallback to control-point interpolation if grid search exceeds budget
    return []

def generate_grid_routes(vessel: dict, origin: dict, destination: dict, icebergs: list, environment: dict) -> list:
    start_pt = (origin["lat"], origin["lng"])
    end_pt = (destination["lat"], destination["lng"])
    
    # Try A* search for candidates
    path_a = run_astar(start_pt, end_pt, icebergs, environment, bias_corridor=None)
    path_b = run_astar(start_pt, end_pt, icebergs, environment, bias_corridor="east")
    path_c = run_astar(start_pt, end_pt, icebergs, environment, bias_corridor="west")
    
    # If A* grid paths are sparse, complement with ocean channel control points
    if len(path_a) < 3:
        control_a = [
            start_pt,
            (-62.45, -58.20),
            (-62.65, -57.10),
            (-62.90, -56.70),
            (-63.30, -56.70),
            (-63.65, -57.10),
            end_pt
        ]
        path_a = interpolate_waypoints(control_a, 3)
    else:
        path_a = interpolate_waypoints(path_a[::max(1, len(path_a)//6)], 2)
        
    if len(path_b) < 3:
        control_b = [
            start_pt,
            (-62.30, -57.20),
            (-62.60, -55.80),
            (-63.10, -55.50),
            (-63.60, -56.20),
            end_pt
        ]
        path_b = interpolate_waypoints(control_b, 3)
    else:
        path_b = interpolate_waypoints(path_b[::max(1, len(path_b)//6)], 2)
        
    if len(path_c) < 3:
        control_c = [
            start_pt,
            (-62.60, -59.80),
            (-63.20, -60.80),
            (-63.90, -60.20),
            (-64.20, -58.50),
            end_pt
        ]
        path_c = interpolate_waypoints(control_c, 3)
    else:
        path_c = interpolate_waypoints(path_c[::max(1, len(path_c)//6)], 2)
        
    return [
        {"id": "a", "name": "ROUTE A — SHORTEST", "tag": "Antarctic Sound Ocean Corridor", "waypoints": path_a},
        {"id": "b", "name": "ROUTE B — SAFER", "tag": "Outer Eastern Deep Ocean Bypass", "waypoints": path_b},
        {"id": "c", "name": "ROUTE C — BALANCED", "tag": "Western Outer Shelf Passage", "waypoints": path_c}
    ]
