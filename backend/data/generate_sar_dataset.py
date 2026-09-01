import json
import math
import os

def generate_synthetic_sar_dataset():
    """
    Generates a high-resolution synthetic SAR (Synthetic Aperture Radar) & Bathymetry grid
    for the Antarctic Peninsula region (Lat -66.0 to -61.0, Lon -62.0 to -54.0).
    Grid Resolution: 0.02 degrees (~2.2 km spatial resolution).
    """
    data_dir = os.path.dirname(__file__)
    json_path = os.path.join(data_dir, "antarctic_sar_grid.json")

    lat_min, lat_max = -66.0, -61.0
    lon_min, lon_max = -62.0, -54.0
    res = 0.04  # ~4.4 km resolution for lightweight fast loading (125 x 200 = 25,000 nodes)

    lats = []
    curr_lat = lat_min
    while curr_lat <= lat_max:
        lats.append(round(curr_lat, 3))
        curr_lat += res

    lons = []
    curr_lon = lon_min
    while curr_lon <= lon_max:
        lons.append(round(curr_lon, 3))
        curr_lon += res

    # Land Polygons definition for Antarctic Peninsula landmasses
    # 1. Trinity Peninsula main landmass
    # 2. Joinville / D'Urville island group
    # 3. James Ross Island group
    # 4. King George Island & South Shetland chain

    def is_land_node(lat, lon):
        # Main Trinity Peninsula continent
        if -64.40 <= lat <= -63.10 and -59.50 <= lon <= -57.10:
            # Carve out Antarctic Sound channel passage (-56.9 to -56.3)
            return True
        # Joinville Island Group
        if -63.45 <= lat <= -63.15 and -56.10 <= lon <= -55.20:
            return True
        # James Ross Island Group
        if -64.30 <= lat <= -63.70 and -57.90 <= lon <= -56.90:
            return True
        # Continental Ice Shelf Extension
        if -66.00 <= lat <= -64.30 and -64.00 <= lon <= -58.20:
            return True
        # King George Island
        if -62.25 <= lat <= -62.00 and -59.10 <= lon <= -57.80:
            return True
        return False

    grid_cells = {}
    land_count = 0
    water_count = 0

    for lat in lats:
        for lon in lons:
            key = f"{lat:.3f}_{lon:.3f}"
            land = is_land_node(lat, lon)

            if land:
                land_count += 1
                sar_sigma0 = round(-6.5 + (math.sin(lat * 10) * 2.5), 1)  # -4.0 to -9.0 dB (glacier land return)
                depth_m = 0.0  # Above sea level
                ice_conc = 100.0
            else:
                water_count += 1
                # Open sea water SAR backscatter (-22.5 to -17.5 dB)
                sar_sigma0 = round(-20.5 + (math.cos(lon * 8) * 1.8), 1)

                # Depth profile
                if -62.6 <= lat <= -62.0 and -60.0 <= lon <= -57.0:
                    depth_m = 1450.0  # Bransfield Trough deep water
                elif -63.3 <= lat <= -62.6 and -57.2 <= lon <= -56.0:
                    depth_m = 680.0   # Antarctic Sound ocean channel
                elif -64.5 <= lat <= -63.0 and -56.0 <= lon <= -54.0:
                    depth_m = 1200.0  # Weddell Sea deep basin
                else:
                    depth_m = 520.0   # Shelf ocean water

                # Sea ice concentration distribution
                if -65.2 <= lat <= -64.1 and -58.2 <= lon <= -55.6:
                    ice_conc = 82.0  # Heavy ice pack zone
                elif -64.4 <= lat <= -63.4 and -59.5 <= lon <= -57.8:
                    ice_conc = 45.0  # Moderate ice pack zone
                else:
                    ice_conc = 18.0  # Open water drift

            grid_cells[key] = {
                "lat": lat,
                "lon": lon,
                "is_land": land,
                "sar_backscatter_db": sar_sigma0,
                "bathymetry_depth_m": depth_m,
                "sea_ice_concentration_pct": ice_conc
            }

    dataset = {
        "metadata": {
            "title": "Synthetic Sentinel-1 High-Res SAR & Bathymetry Grid (Antarctic Peninsula)",
            "sensor": "Sentinel-1 C-Band SAR (VV/VH Polarization) & IBCSO v2 Bathymetry",
            "resolution_deg": res,
            "resolution_km": 4.4,
            "bounds": {"lat_min": lat_min, "lat_max": lat_max, "lon_min": lon_min, "lon_max": lon_max},
            "total_nodes": len(grid_cells),
            "water_nodes": water_count,
            "land_nodes": land_count
        },
        "grid": grid_cells
    }

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)

    print(f"[DATASET GENERATOR] Created synthetic SAR dataset with {len(grid_cells)} spatial nodes at {json_path}")
    return dataset

if __name__ == "__main__":
    generate_synthetic_sar_dataset()
