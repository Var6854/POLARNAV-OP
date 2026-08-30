import React from 'react';
import { useAppState } from '../../context/StateContext';
import { PolarMap } from '../map/PolarMap';
import { AlertTriangle, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const {
    selectedVessel,
    origin,
    destination,
    icebergs,
    candidateRoutes,
    activeRouteId,
    alertActive,
    icebergEventTriggered,
    rerouteCalculated,
    rerouteAccepted,
    triggerIcebergTrajectoryEvent,
    reassessRoute,
    acceptReroute,
    navigatePage
  } = useAppState();

  const routeA = candidateRoutes.find((r) => r.id === 'a') || candidateRoutes[0];
  const routeB = candidateRoutes.find((r) => r.id === 'b') || candidateRoutes[1];

  return (
    <div className="page-container alerts-page">
      <div className="page-header-box">
        <div className="page-title-row">
          <AlertTriangle className="text-rose-400 animate-pulse" size={24} />
          <div>
            <h1>ALERTS & EXPLAINABLE REROUTING ADVISORY</h1>
            <p>Real-time SAR anomaly detection, dynamic risk recalculation, and explainable decision support.</p>
          </div>
        </div>
      </div>

      <div className="alerts-layout-grid">
        <div className="advisory-main-panel">
          {!icebergEventTriggered ? (
            <div className="no-alert-card">
              <ShieldCheck size={36} className="text-emerald-400" />
              <h3>ALL VOYAGE CORRIDORS CLEAR</h3>
              <p>No active critical iceberg trajectory conflicts. Navigation status is NORMAL.</p>

              <button className="btn-primary-glow" style={{ marginTop: 16 }} onClick={triggerIcebergTrajectoryEvent}>
                <AlertTriangle size={16} /> SIMULATE ICEBERG TRAJECTORY CHANGE
              </button>
            </div>
          ) : (
            <div className="active-advisory-card">
              <div className="advisory-badge-header">
                <AlertTriangle size={18} className="text-rose-400" />
                <span>CRITICAL NAVIGATION ADVISORY #SAR-9042</span>
              </div>

              <h2>IB-042 TRAJECTORY ALTERATION — ROUTE A HAZARD</h2>

              <div className="advisory-explanation-box">
                <p>
                  <strong>SAR INTELLIGENCE SUMMARY:</strong> Sentinel-1B high-resolution pass at 10:30 UTC detected IB-042 shifting heading to 135° SE with an accelerated drift speed of 0.58 m/s.
                </p>
                <p>
                  <strong>HAZARD IMPACT:</strong> Submerged keel depth profile (148 m) directly encroaches upon Route A corridor. Estimated clearance reduced to &lt;1.5 km.
                </p>
              </div>

              <div className="route-comparison-table">
                <div className="comp-col current">
                  <span className="col-lbl">CURRENT ACTIVE ROUTE</span>
                  <h3>{routeA?.name}</h3>
                  <div className="risk-tag high">HIGH RISK ({routeA?.riskScore}/100)</div>
                  <ul className="comp-features">
                    <li>Clearance: &lt;1.5 km (Hazard Violation)</li>
                    <li>Status: AVOID / CRITICAL EXPOSURE</li>
                    <li>Distance: {routeA?.distanceKm} km</li>
                  </ul>
                </div>

                <div className="comp-vs">VS</div>

                <div className="comp-col recommended">
                  <span className="col-lbl">RECOMMENDED ALTERNATIVE</span>
                  <h3>{routeB?.name}</h3>
                  <div className="risk-tag low">LOW RISK ({routeB?.riskScore}/100)</div>
                  <ul className="comp-features">
                    <li>Clearance: &gt;28.0 km (Safe Ocean Water)</li>
                    <li>Status: RECOMMENDED BY A* ENGINE</li>
                    <li>Distance: {routeB?.distanceKm} km (+18 km delta)</li>
                  </ul>
                </div>
              </div>

              <div className="advisory-actions-bar">
                {!rerouteCalculated ? (
                  <button className="btn-action-glow reassess" onClick={reassessRoute}>
                    <RefreshCw size={16} /> RE-EVALUATE RISKS & GENERATE ROUTE B
                  </button>
                ) : !rerouteAccepted ? (
                  <button className="btn-action-glow accept" onClick={acceptReroute}>
                    <CheckCircle2 size={16} /> ACCEPT REROUTE TO ROUTE B
                  </button>
                ) : (
                  <div className="accepted-success-banner">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <strong>OPERATOR ACCEPTED REROUTE — ROUTE B ACTIVE ON INSV POLARIS</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="alerts-map-sidebar">
          <PolarMap
            vessel={selectedVessel}
            origin={origin}
            destination={destination}
            icebergs={icebergs}
            candidateRoutes={candidateRoutes}
            activeRouteId={activeRouteId}
            vesselProgressPercent={18}
          />
        </div>
      </div>
    </div>
  );
};
