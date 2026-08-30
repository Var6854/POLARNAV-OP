import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LeafletStyles.css';
import type { Vessel, LocationPoint, Iceberg, CandidateRoute } from '../../types';
import { Layers, Navigation } from 'lucide-react';

// Override default Leaflet icon URLs to prevent bundler asset loading issues on Vercel
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PolarMapProps {
  vessel: Vessel | null;
  origin: LocationPoint;
  destination: LocationPoint | null;
  icebergs: Iceberg[];
  candidateRoutes: CandidateRoute[];
  activeRouteId: 'a' | 'b' | 'c';
  vesselProgressPercent: number;
  allowMapClickDestination?: boolean;
  onSelectDestinationClick?: (lat: number, lng: number) => void;
  onSelectIceberg?: (iceberg: Iceberg) => void;
  showSeaIceLayer?: boolean;
  showRiskHeatmap?: boolean;
  showIcebergs?: boolean;
  showTrajectories?: boolean;
}

export const PolarMap: React.FC<PolarMapProps> = ({
  vessel,
  origin,
  destination,
  icebergs,
  candidateRoutes,
  activeRouteId,
  vesselProgressPercent,
  allowMapClickDestination = false,
  onSelectDestinationClick,
  onSelectIceberg,
  showSeaIceLayer = true,
  showRiskHeatmap = true,
  showIcebergs = true,
  showTrajectories = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [layersOpen, setLayersOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    seaIce: showSeaIceLayer,
    risk: showRiskHeatmap,
    icebergs: showIcebergs,
    trajectories: showTrajectories,
    routes: true,
    temperature: true,
    wind: true,
    visibility: true
  });

  const getVesselCurrentPosition = (): [number, number] => {
    const activeRoute = candidateRoutes.find((r) => r.id === activeRouteId) || candidateRoutes[0];
    if (!activeRoute || activeRoute.waypoints.length === 0) {
      return [origin.lat, origin.lng];
    }
    const waypoints = activeRoute.waypoints;
    const totalSegments = waypoints.length - 1;
    const rawIndex = (vesselProgressPercent / 100) * totalSegments;
    const segIndex = Math.min(Math.floor(rawIndex), totalSegments - 1);
    const fraction = rawIndex - segIndex;

    const p1 = waypoints[segIndex];
    const p2 = waypoints[segIndex + 1] || p1;

    const currentLat = p1[0] + (p2[0] - p1[0]) * fraction;
    const currentLng = p1[1] + (p2[1] - p1[1]) * fraction;

    return [currentLat, currentLng];
  };

  const vesselPos = getVesselCurrentPosition();

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [-63.1, -57.5];
    const initialZoom = 8;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (allowMapClickDestination && onSelectDestinationClick) {
        const lat = Number(e.latlng.lat.toFixed(4));
        const lng = Number(e.latlng.lng.toFixed(4));
        onSelectDestinationClick(lat, lng);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [allowMapClickDestination, onSelectDestinationClick]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Heterogeneous Sea Ice Concentration Zones
    if (activeLayers.seaIce) {
      const heavyIcePoly = L.polygon(
        [
          [-64.1, -57.1],
          [-64.3, -55.8],
          [-65.2, -55.6],
          [-65.0, -58.2]
        ],
        {
          color: '#0284c7',
          weight: 1.5,
          fillColor: '#0369a1',
          fillOpacity: 0.35,
          dashArray: '2, 2'
        }
      );
      heavyIcePoly.bindTooltip('<b>HEAVY PACK ICE ZONE (82% Concentration)</b><br/>Severe Navigation Risk — Avoided by A* Pathfinder', { sticky: true });
      layerGroup.addLayer(heavyIcePoly);

      const modIcePoly = L.polygon(
        [
          [-63.4, -58.8],
          [-63.8, -57.8],
          [-64.4, -58.5],
          [-64.1, -59.5]
        ],
        {
          color: '#38bdf8',
          weight: 1,
          fillColor: '#0284c7',
          fillOpacity: 0.18,
          dashArray: '4, 4'
        }
      );
      modIcePoly.bindTooltip('Moderate Pack Ice (45% Concentration)', { sticky: true });
      layerGroup.addLayer(modIcePoly);

      const lightIcePoly = L.polygon(
        [
          [-62.3, -59.4],
          [-62.7, -58.5],
          [-63.1, -59.2],
          [-62.8, -60.0]
        ],
        {
          color: '#38bdf8',
          weight: 1,
          fillColor: '#38bdf8',
          fillOpacity: 0.08,
          dashArray: '6, 6'
        }
      );
      lightIcePoly.bindTooltip('Light Sea-Ice Drift (18% Concentration - Open Sea Corridor)', { sticky: true });
      layerGroup.addLayer(lightIcePoly);
    }

    // 2. Dynamic Risk Heatmap Centered Directly on Hazardous Icebergs & Intersecting Route A
    if (activeLayers.risk) {
      icebergs.forEach((ib) => {
        if (ib.status === 'CRITICAL' || ib.status === 'WATCH') {
          const circleRadiusMeters = (ib.hazardRadius || 5.5) * 1000;
          const hazardCircle = L.circle([ib.lat, ib.lng], {
            radius: circleRadiusMeters,
            color: '#f43f5e',
            fillColor: '#f43f5e',
            fillOpacity: 0.28,
            weight: 2,
            className: 'hazard-heatmap-pulse'
          });
          hazardCircle.bindTooltip(
            `<b>HAZARD RISK HEATMAP: ${ib.name}</b><br/>Status: ${ib.status}<br/>Clearance Radius: ${ib.hazardRadius} km<br/>${
              ib.status === 'CRITICAL' ? '⚠ DIRECT ROUTE A INTERSECTION' : 'Watch Status'
            }`,
            { sticky: true }
          );
          layerGroup.addLayer(hazardCircle);

          if (ib.predictedTrajectory && ib.predictedTrajectory.length > 0) {
            ib.predictedTrajectory.forEach((pt) => {
              const trajCircle = L.circle(pt, {
                radius: circleRadiusMeters * 0.7,
                color: '#fbbf24',
                fillColor: '#f43f5e',
                fillOpacity: 0.16,
                weight: 1
              });
              layerGroup.addLayer(trajCircle);
            });
          }
        }
      });
    }

    // 3. Temperature & Isotherm Overlay
    if (activeLayers.temperature) {
      const isotherm = L.polyline(
        [
          [-62.0, -59.5],
          [-62.8, -58.5],
          [-63.5, -57.5],
          [-64.2, -56.5]
        ],
        {
          color: '#38bdf8',
          weight: 1.5,
          dashArray: '8, 8',
          opacity: 0.7
        }
      );
      isotherm.bindTooltip('Isotherm Contour: -2.0°C Sea Surface Freeze Line', { sticky: true });
      layerGroup.addLayer(isotherm);

      const tempIcon = L.divIcon({
        className: 'temp-badge-icon',
        html: `<div class="temp-badge"><span class="t-icon">🌡</span> Air: -4.2°C | Sea: -1.8°C</div>`,
        iconSize: [160, 24],
        iconAnchor: [80, 12]
      });
      const tempMarker = L.marker([-62.4, -57.8], { icon: tempIcon });
      layerGroup.addLayer(tempMarker);
    }

    // 4. Wind Vector Overlay
    if (activeLayers.wind) {
      const windIcon = L.divIcon({
        className: 'wind-vector-icon',
        html: `
          <div class="wind-vector-box">
            <svg class="wind-arrow" style="transform: rotate(210deg);" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fbbf24" stroke-width="2">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
            <span>SSW 18 kn</span>
          </div>
        `,
        iconSize: [100, 24],
        iconAnchor: [50, 12]
      });
      const windMarker = L.marker([-63.0, -58.2], { icon: windIcon });
      layerGroup.addLayer(windMarker);
    }

    // 5. Visibility & SAR Radar Range Overlay
    if (activeLayers.visibility && vesselPos) {
      const visualRangeCircle = L.circle(vesselPos, {
        radius: 8500,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '4, 4'
      });
      visualRangeCircle.bindTooltip('Visual Observation Range: 8.5 km', { sticky: true });
      layerGroup.addLayer(visualRangeCircle);

      const sarRadarCircle = L.circle(vesselPos, {
        radius: 45000,
        color: '#06b6d4',
        fillColor: '#06b6d4',
        fillOpacity: 0.03,
        weight: 1,
        dashArray: '2, 6'
      });
      sarRadarCircle.bindTooltip('Satellite SAR Radar Sweep Area: 45 km', { sticky: true });
      layerGroup.addLayer(sarRadarCircle);
    }

    // 6. Candidate & Active Routes
    if (activeLayers.routes && candidateRoutes.length > 0) {
      candidateRoutes.forEach((route) => {
        const isActive = route.id === activeRouteId;
        const color = isActive
          ? route.riskCategory === 'HIGH' || route.riskCategory === 'CRITICAL'
            ? '#f43f5e'
            : '#10b981'
          : route.id === 'a'
          ? '#eab308'
          : '#38bdf8';

        const polyline = L.polyline(route.waypoints, {
          color,
          weight: isActive ? 5 : 2.5,
          opacity: isActive ? 0.95 : 0.45,
          dashArray: isActive ? undefined : '6, 6',
          className: isActive ? 'route-active' : ''
        });

        polyline.bindTooltip(
          `${route.name} (${route.distanceKm} km | Risk: ${route.riskCategory})`,
          { sticky: true }
        );
        layerGroup.addLayer(polyline);
      });
    }

    // 7. Tracked Icebergs & Trajectories
    if (activeLayers.icebergs) {
      icebergs.forEach((ib) => {
        const isCritical = ib.status === 'CRITICAL' || ib.status === 'WATCH';

        const customIcon = L.divIcon({
          className: 'iceberg-marker-icon',
          html: `<div class="iceberg-node ${isCritical ? 'critical' : ''}">${ib.id}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([ib.lat, ib.lng], { icon: customIcon });
        marker.on('click', () => {
          if (onSelectIceberg) onSelectIceberg(ib);
        });

        marker.bindTooltip(
          `<b>${ib.name}</b><br/>Status: ${ib.status}<br/>Size: ${ib.estimatedSize} km | Keel: ${ib.keelDepth}m`,
          { sticky: true }
        );
        layerGroup.addLayer(marker);

        if (activeLayers.trajectories && ib.predictedTrajectory.length > 0) {
          const trajLine = L.polyline(ib.predictedTrajectory, {
            color: isCritical ? '#f43f5e' : '#06b6d4',
            weight: 2,
            dashArray: '4, 4',
            opacity: 0.85
          });
          layerGroup.addLayer(trajLine);

          if (ib.uncertaintyCorridor && ib.uncertaintyCorridor.length > 0) {
            const corridorPoly = L.polygon(ib.uncertaintyCorridor[0], {
              color: isCritical ? '#f43f5e' : '#06b6d4',
              fillColor: isCritical ? '#f43f5e' : '#06b6d4',
              fillOpacity: isCritical ? 0.18 : 0.08,
              weight: 1,
              dashArray: '2, 2'
            });
            layerGroup.addLayer(corridorPoly);
          }
        }
      });
    }

    // 8. Origin Marker
    const originIcon = L.divIcon({
      className: 'destination-marker-icon',
      html: `<div class="destination-flag" style="border-color:#38bdf8; color:#38bdf8;"><span style="font-size:10px; font-weight:bold;">ORG</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon });
    originMarker.bindTooltip(`<b>ORIGIN: ${origin.name}</b>`, { sticky: true });
    layerGroup.addLayer(originMarker);

    // 9. Destination Marker
    if (destination) {
      const destIcon = L.divIcon({
        className: 'destination-marker-icon',
        html: `<div class="destination-flag"><span style="font-size:10px; font-weight:bold;">DEST</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon });
      destMarker.bindTooltip(
        `<b>DESTINATION: ${destination.name}</b><br/>${destination.lat.toFixed(2)}°S ${Math.abs(destination.lng).toFixed(2)}°W`,
        { sticky: true }
      );
      layerGroup.addLayer(destMarker);
    }

    // 10. Vessel Marker
    const vesselIcon = L.divIcon({
      className: 'vessel-marker-icon',
      html: `
        <div class="vessel-pulse-container">
          <div class="vessel-pulse-ring"></div>
          <svg class="vessel-boat-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const vesselMarker = L.marker(vesselPos, { icon: vesselIcon });
    vesselMarker.bindTooltip(
      `<b>${vessel?.name || 'VESSEL'}</b><br/>Speed: ${vessel?.cruisingSpeed || 12} kn | Progress: ${Math.round(vesselProgressPercent)}%`,
      { sticky: true }
    );
    layerGroup.addLayer(vesselMarker);
  }, [
    activeLayers,
    candidateRoutes,
    activeRouteId,
    icebergs,
    origin,
    destination,
    vessel,
    vesselPos,
    vesselProgressPercent,
    onSelectIceberg
  ]);

  return (
    <div className="polar-map-container">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
        <button
          onClick={() => setLayersOpen(!layersOpen)}
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            backdropFilter: 'blur(8px)'
          }}
        >
          <Layers size={14} /> Layers & Controls
        </button>

        {layersOpen && (
          <div
            style={{
              marginTop: '6px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '220px',
              fontSize: '12px',
              color: '#e2e8f0',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activeLayers.seaIce}
                onChange={(e) => setActiveLayers({ ...activeLayers, seaIce: e.target.checked })}
              />
              Sea-Ice Concentration Zones
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activeLayers.risk}
                onChange={(e) => setActiveLayers({ ...activeLayers, risk: e.target.checked })}
              />
              Hazard Risk Heatmap
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activeLayers.icebergs}
                onChange={(e) => setActiveLayers({ ...activeLayers, icebergs: e.target.checked })}
              />
              Tracked Icebergs
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activeLayers.trajectories}
                onChange={(e) => setActiveLayers({ ...activeLayers, trajectories: e.target.checked })}
              />
              SAR Trajectories
            </label>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activeLayers.temperature}
                onChange={(e) => setActiveLayers({ ...activeLayers, temperature: e.target.checked })}
              />
              🌡 Temperature (-4.2°C)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activeLayers.wind}
                onChange={(e) => setActiveLayers({ ...activeLayers, wind: e.target.checked })}
              />
              💨 Wind Vectors (SSW 18kn)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activeLayers.visibility}
                onChange={(e) => setActiveLayers({ ...activeLayers, visibility: e.target.checked })}
              />
              👁 Visibility (8.5km / 45km)
            </label>
          </div>
        )}
      </div>

      {allowMapClickDestination && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #10b981',
            color: '#10b981',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Navigation size={14} className="animate-spin" />
          Click anywhere on the Antarctic map to select custom destination
        </div>
      )}
    </div>
  );
};
