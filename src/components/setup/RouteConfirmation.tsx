import React from 'react';
import { useAppState } from '../../context/StateContext';
import { PolarMap } from '../map/PolarMap';
import { Play, ShieldCheck, Ship, Navigation, CheckCircle2 } from 'lucide-react';

export const RouteConfirmation: React.FC = () => {
  const {
    selectedVessel,
    origin,
    destination,
    icebergs,
    candidateRoutes,
    activeRouteId,
    startVoyage
  } = useAppState();

  const selectedRoute = candidateRoutes.find((r) => r.id === activeRouteId) || candidateRoutes[0];

  return (
    <div className="setup-container">
      <div className="setup-header-panel">
        <div className="setup-eyebrow">STEP 5 OF 5 — FINAL VOYAGE CONFIRMATION</div>
        <h1 className="setup-title">CONFIRM MISSION & LAUNCH VOYAGE</h1>
        <p className="setup-subtitle">
          Review voyage clearance, environmental risk profile, and launch NCPOR research vessel onto confirmed route.
        </p>
      </div>

      <div className="confirm-split-layout">
        <div className="confirm-details-card">
          <div className="card-header-badge">
            <ShieldCheck size={20} className="text-emerald-400" />
            <span>VOYAGE PLAN VERIFIED BY POLARNAV RISK ENGINE</span>
          </div>

          <div className="confirm-summary-section">
            <div className="vessel-confirm-box">
              <Ship size={28} className="text-cyan-400" />
              <div>
                <span className="lbl">SELECTED VESSEL</span>
                <h3>{selectedVessel?.name}</h3>
                <small>{selectedVessel?.type} ({selectedVessel?.iceCapability})</small>
              </div>
            </div>

            <div className="route-confirm-box">
              <Navigation size={28} className="text-emerald-400" />
              <div>
                <span className="lbl">CONFIRMED ROUTE</span>
                <h3>{selectedRoute?.name}</h3>
                <small>{selectedRoute?.tag} ({selectedRoute?.distanceKm} km | {selectedRoute?.etaHours} hrs)</small>
              </div>
            </div>
          </div>

          <div className="confirm-risk-box">
            <span className="lbl">INITIAL RISK ASSESSMENT</span>
            <div className="risk-score-display">
              <span className="score-num text-emerald-400">{selectedRoute?.riskScore}/100</span>
              <span className="score-cat badge-ok">{selectedRoute?.riskCategory} RISK</span>
            </div>
            <p className="risk-explanation">{selectedRoute?.description}</p>
          </div>

          <button className="btn-launch-glow" onClick={startVoyage}>
            <Play size={20} /> LAUNCH ANTARCTIC VOYAGE
          </button>
        </div>

        <div className="confirm-map-wrapper">
          <PolarMap
            vessel={selectedVessel}
            origin={origin}
            destination={destination}
            icebergs={icebergs}
            candidateRoutes={candidateRoutes}
            activeRouteId={activeRouteId}
            vesselProgressPercent={0}
          />
        </div>
      </div>
    </div>
  );
};
