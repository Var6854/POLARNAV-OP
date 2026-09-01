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

  const activeRoute = candidateRoutes.find((r) => r.id === activeRouteId) || candidateRoutes[0];
  const recommendedRoute =
    candidateRoutes.find((r) => r.status === 'RECOMMENDED') ||
    candidateRoutes.find((r) => r.id !== activeRouteId) ||
    candidateRoutes[1];

  const activeName = activeRoute ? activeRoute.name : 'ACTIVE ROUTE';
  const recName = recommendedRoute ? recommendedRoute.name : 'RECOMMENDED ALTERNATIVE';

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

              <h2>IB-042 TRAJECTORY ALTERATION — {activeName} HAZARD</h2>

              <div className="advisory-explanation-box">
                <p>
                  <strong>SAR INTELLIGENCE SUMMARY:</strong> Sentinel-1B high-resolution pass at 10:30 UTC detected IB-042 shifting heading to 135° SE with an accelerated drift speed of 0.58 m/s.
                </p>
                <p>
                  <strong>HAZARD IMPACT:</strong> Submerged keel depth profile (148 m) directly encroaches upon {activeName} corridor. Estimated clearance reduced to &lt;1.5 km.
                </p>
              </div>

              <div className="route-comparison-table">
                <div className="comp-col current">
                  <span className="col-lbl">CURRENT ACTIVE ROUTE</span>
                  <h3>{activeRoute?.name}</h3>
                  <div className={`risk-tag ${activeRoute?.riskCategory === 'HIGH' || activeRoute?.riskCategory === 'CRITICAL' ? 'high' : 'low'}`}>
                    {activeRoute?.riskCategory} RISK ({activeRoute?.riskScore}/100)
                  </div>
                  <ul className="comp-features">
                    <li>Clearance: {activeRoute?.riskCategory === 'HIGH' ? '<1.5 km (Hazard Violation)' : '>25 km (Clear Ocean)'}</li>
                    <li>Status: {activeRoute?.status}</li>
                    <li>Distance: {activeRoute?.distanceKm} km</li>
                  </ul>
                </div>

                <div className="comp-vs">VS</div>

                <div className="comp-col recommended">
                  <span className="col-lbl">RECOMMENDED ALTERNATIVE</span>
                  <h3>{recommendedRoute?.name}</h3>
                  <div className="risk-tag low">LOW RISK ({recommendedRoute?.riskScore}/100)</div>
                  <ul className="comp-features">
                    <li>Clearance: &gt;28.0 km (Safe Ocean Water)</li>
                    <li>Status: {recommendedRoute?.status} BY A* ENGINE</li>
                    <li>Distance: {recommendedRoute?.distanceKm} km (+{Math.max(0, (recommendedRoute?.distanceKm || 0) - (activeRoute?.distanceKm || 0))} km delta)</li>
                  </ul>
                </div>
              </div>

              <div className="advisory-actions-bar">
                {!rerouteCalculated ? (
                  <button className="btn-action-glow reassess" onClick={reassessRoute}>
                    <RefreshCw size={16} /> RE-EVALUATE RISKS & GENERATE {recName}
                  </button>
                ) : !rerouteAccepted ? (
                  <button className="btn-action-glow accept" onClick={acceptReroute}>
                    <CheckCircle2 size={16} /> ACCEPT REROUTE TO {recName}
                  </button>
                ) : (
                  <div className="accepted-success-banner">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <strong>OPERATOR ACCEPTED REROUTE — {activeRoute?.name} ACTIVE ON INSV POLARIS</strong>
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
