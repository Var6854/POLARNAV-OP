import React from 'react';
import { useAppState } from '../../context/StateContext';
import { Route as RouteIcon, CheckCircle2, ShieldAlert, Sparkles, Navigation } from 'lucide-react';

export const RoutePage: React.FC = () => {
  const { candidateRoutes, activeRouteId, acceptReroute } = useAppState();

  return (
    <div className="page-container route-page">
      <div className="page-header-box">
        <div className="page-title-row">
          <RouteIcon className="text-cyan-400" size={24} />
          <div>
            <h1>ROUTE INTELLIGENCE & A* MULTI-CRITERIA COMPARISON</h1>
            <p>Evaluation of candidate corridors based on distance, ETA, sea ice exposure, and iceberg clearance.</p>
          </div>
        </div>
      </div>

      <div className="routes-comparison-grid">
        {candidateRoutes.map((route) => {
          const isActive = route.id === activeRouteId;

          return (
            <div key={route.id} className={`route-compare-card ${isActive ? 'active-route' : ''}`}>
              <div className="card-top-tag">
                <span className="tag-name">{route.tag}</span>
                {isActive && <span className="active-pill">✓ ACTIVE VOYAGE ROUTE</span>}
              </div>

              <h3>{route.name}</h3>
              <p className="route-desc">{route.description}</p>

              <div className="metrics-box">
                <div className="m-row">
                  <span>DISTANCE</span>
                  <strong>{route.distanceKm} km</strong>
                </div>
                <div className="m-row">
                  <span>ESTIMATED TIME</span>
                  <strong>{route.etaHours} hours</strong>
                </div>
                <div className="m-row">
                  <span>FUEL CONSUMPTION</span>
                  <strong>{(route.fuelLiters / 1000).toFixed(1)}k L</strong>
                </div>
                <div className="m-row">
                  <span>RISK CATEGORY</span>
                  <strong className={route.riskCategory === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'}>
                    {route.riskCategory} ({route.riskScore}/100)
                  </strong>
                </div>
              </div>

              <div className="cost-bars-section">
                <span className="section-title">A* MULTI-CRITERIA COST MATRIX</span>

                <div className="cost-item">
                  <span className="lbl">Iceberg Hazard</span>
                  <div className="bar-track">
                    <div className="bar-fill red" style={{ width: `${route.costBreakdown.iceberg}%` }} />
                  </div>
                </div>

                <div className="cost-item">
                  <span className="lbl">Sea Ice Concentration</span>
                  <div className="bar-track">
                    <div className="bar-fill cyan" style={{ width: `${route.costBreakdown.seaIce}%` }} />
                  </div>
                </div>

                <div className="cost-item">
                  <span className="lbl">Weather Exposure</span>
                  <div className="bar-track">
                    <div className="bar-fill amber" style={{ width: `${route.costBreakdown.weather}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
