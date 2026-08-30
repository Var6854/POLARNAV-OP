import React from 'react';
import { useAppState } from '../../context/StateContext';
import { PolarMap } from '../map/PolarMap';
import { AlertTriangle, ShieldCheck, Radio, Play, RefreshCw, Compass, ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    selectedVessel,
    origin,
    destination,
    environment,
    icebergs,
    candidateRoutes,
    activeRouteId,
    vesselProgressPercent,
    alertActive,
    icebergEventTriggered,
    rerouteCalculated,
    rerouteAccepted,
    timeline,
    triggerIcebergTrajectoryEvent,
    reassessRoute,
    acceptReroute,
    navigatePage
  } = useAppState();

  const activeRoute = candidateRoutes.find((r) => r.id === activeRouteId) || candidateRoutes[0];

  return (
    <div className="page-container dashboard-page">
      {alertActive && (
        <div className="alert-banner-critical">
          <div className="banner-icon">
            <AlertTriangle size={24} className="text-rose-400 animate-bounce" />
          </div>
          <div className="banner-content">
            <span className="banner-tag">CRITICAL ALERT — SATELLITE SAR UPDATE</span>
            <h3>⚠ ROUTE A EXPOSURE INCREASED: IB-042 TRAJECTORY ALTERATION</h3>
            <p>
              Sentinel-1 SAR orbit pass detected IB-042 shifting toward NW corridor (Drift 0.58 m/s). Risk score on Route A jumped from 22 to 84 (HIGH). Immediate reroute recommended.
            </p>
          </div>
          <div className="banner-actions">
            <button className="btn-banner-action" onClick={() => navigatePage('alerts')}>
              VIEW REROUTE ADVISORY <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-map-card">
          <div className="card-header-overlay">
            <span className="live-pill">LIVE GIS MONITORING</span>
            <h3>ANTARCTIC MARITIME COMMAND MAP</h3>
          </div>

          <PolarMap
            vessel={selectedVessel}
            origin={origin}
            destination={destination}
            icebergs={icebergs}
            candidateRoutes={candidateRoutes}
            activeRouteId={activeRouteId}
            vesselProgressPercent={vesselProgressPercent}
          />
        </div>

        <div className="dashboard-side-panel">
          <div className="demo-control-quick-box">
            <span className="box-eyebrow">DEMO SCENARIO SHORTCUTS</span>
            <h3>Vessel Voyage & Hazard Simulator</h3>

            <div className="quick-btn-group">
              <button
                className={`btn-quick ${icebergEventTriggered ? 'active' : ''}`}
                onClick={triggerIcebergTrajectoryEvent}
              >
                <AlertTriangle size={14} /> 1. Shift IB-042 Drift
              </button>

              <button
                className={`btn-quick ${rerouteCalculated ? 'active' : ''}`}
                disabled={!icebergEventTriggered}
                onClick={reassessRoute}
              >
                <RefreshCw size={14} /> 2. Recalculate A*
              </button>

              <button
                className={`btn-quick ${rerouteAccepted ? 'active' : ''}`}
                disabled={!rerouteCalculated}
                onClick={acceptReroute}
              >
                <Play size={14} /> 3. Accept Route B
              </button>
            </div>
          </div>

          <div className="vessel-status-card">
            <div className="card-title">VESSEL TELEMETRY</div>
            <div className="telemetry-grid">
              <div className="t-cell">
                <span className="lbl">VESSEL</span>
                <strong className="val">{selectedVessel?.name}</strong>
              </div>
              <div className="t-cell">
                <span className="lbl">SPEED</span>
                <strong className="val">{selectedVessel?.cruisingSpeed} kn</strong>
              </div>
              <div className="t-cell">
                <span className="lbl">PROGRESS</span>
                <strong className="val">{Math.round(vesselProgressPercent)}%</strong>
              </div>
              <div className="t-cell">
                <span className="lbl">DRAFT</span>
                <strong className="val">{selectedVessel?.draft} m</strong>
              </div>
            </div>
          </div>

          <div className="active-route-card">
            <div className="card-title">ACTIVE VOYAGE ROUTE</div>
            <div className="route-header-info">
              <span className={`status-pill ${activeRoute?.status.toLowerCase()}`}>
                {activeRoute?.status}
              </span>
              <h3>{activeRoute?.name}</h3>
              <p className="route-tag-sub">{activeRoute?.tag}</p>
            </div>

            <div className="risk-indicator-box">
              <div className="risk-header-line">
                <span>NAVIGATION RISK SCORE</span>
                <strong
                  className={`score-highlight ${
                    activeRoute?.riskCategory === 'HIGH' || activeRoute?.riskCategory === 'CRITICAL'
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {activeRoute?.riskScore}/100 ({activeRoute?.riskCategory})
                </strong>
              </div>
              <div className="risk-bar-track">
                <div
                  className={`risk-bar-fill ${
                    activeRoute?.riskCategory === 'HIGH' || activeRoute?.riskCategory === 'CRITICAL'
                      ? 'high'
                      : 'low'
                  }`}
                  style={{ width: `${activeRoute?.riskScore || 20}%` }}
                />
              </div>
            </div>
          </div>

          <div className="timeline-card">
            <div className="card-title">VOYAGE INTELLIGENCE LOG</div>
            <div className="timeline-feed">
              {timeline.slice(-4).map((event) => (
                <div key={event.id} className={`timeline-entry ${event.type}`}>
                  <span className="t-time">{event.time}</span>
                  <strong className="t-title">{event.title}</strong>
                  <p className="t-desc">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
