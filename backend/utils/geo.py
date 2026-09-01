import math

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def point_to_route_distance_km(point: list, route_waypoints: list) -> float:
    if not route_waypoints or len(route_waypoints) == 0:
        return 999.0
    min_dist = float('inf')
    for wp in route_waypoints:
        d = haversine_distance_km(point[0], point[1], wp[0], wp[1])
        if d < min_dist:
            min_dist = d
    return min_dist

def interpolate_waypoints(control_points: list, points_per_segment: int = 3) -> list:
    waypoints = []
    for i in range(len(control_points) - 1):
        p1 = control_points[i]
        p2 = control_points[i + 1]
        for j in range(points_per_segment):
            t = j / float(points_per_segment)
            lat = p1[0] + (p2[0] - p1[0]) * t
            lng = p1[1] + (p2[1] - p1[1]) * t
            waypoints.append([round(lat, 4), round(lng, 4)])
    waypoints.append([round(control_points[-1][0], 4), round(control_points[-1][1], 4)])
    return waypoints

def calculate_total_route_distance_km(waypoints: list) -> int:
    total = 0.0
    for i in range(len(waypoints) - 1):
        total += haversine_distance_km(
            waypoints[i][0], waypoints[i][1],
            waypoints[i + 1][0], waypoints[i + 1][1]
        )
    return int(round(total))
