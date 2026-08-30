import React from 'react';
import { useAppState } from '../../context/StateContext';
import { PolarMap } from '../map/PolarMap';
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, Navigation } from 'lucide-react';

export const RouteGeneration: React.FC = () => {
  const {
    selectedVessel,
    origin,
    destination,
    icebergs,
    candidateRoutes,
    selectInitialRoute
  } = useAppState();

  return (
    <div className="setup-container">
      <div className="setup-header-panel">
        <div className="setup-eyebrow">STEP 4 OF 5 — CANDIDATE ROUTE GENERATION</div>
        <h1 className="setup-title">SELECT OPTIMAL CANDIDATE ROUTE</h1>
        <p className="setup-subtitle">
          «PolarNav A* Engine evaluated 3 candidate corridors against ice concentration, iceberg hazard radius, and fuel consumption.»
        </p>
      </div>

      <div className="route-selection-grid">
        <div className="routes-list-sidebar">
          {candidateRoutes.map((route) => {
            const isRecommended = route.status === 'RECOMMENDED';

            return (
              <div key={route.id} className={`candidate-route-card ${isRecommended ? 'recommended' : ''}`}>
                {isRecommended && (
                  <div className="recommended-badge">
                    <Sparkles size={14} /> RECOMMENDED BY POLARNAV
                  </div>
                )}

                <div className="route-card-header">
                  <div>
                    <span className="route-tag">{route.tag}</span>
                    <h3 className="route-title">{route.name}</h3>
                  </div>
                  <span className={`risk-badge-pill ${route.riskCategory.toLowerCase()}`}>
                    {route.riskCategory} RISK ({route.riskScore}/100)
                  </span>
                </div>

                <p className="route-desc">{route.description}</p>

                <div className="route-metrics-row">
                  <div className="metric">
                    <span className="lbl">DISTANCE</span>
                    <strong className="val">{route.distanceKm} km</strong>
                  </div>
                  <div className="metric">
                    <span className="lbl">ETA</span>
                    <strong className="val">{route.etaHours} hrs</strong>
                  </div>
                  <div className="metric">
                    <span className="lbl">EST. FUEL</span>
                    <strong className="val">{(route.fuelLiters / 1000).toFixed(1)}k L</strong>
                  </div>
                  <div className="metric">
                    <span className="lbl">ICE EXPOSURE</span>
                    <strong className="val text-cyan-400">{route.seaIceExposure}</strong>
                  </div>
                </div>

                <button className="btn-select-route" onClick={() => selectInitialRoute(route.id)}>
                  SELECT {route.name} <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="route-map-preview">
          <PolarMap
            vessel={selectedVessel}
            origin={origin}
            destination={destination}
            icebergs={icebergs}
            candidateRoutes={candidateRoutes}
            activeRouteId="a"
            vesselProgressPercent={0}
          />
        </div>
      </div>
    </div>
  );
};
