import React from 'react';
import { useAppState } from '../../context/StateContext';
import { X, Play, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export const DemoControlModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    icebergEventTriggered,
    rerouteCalculated,
    rerouteAccepted,
    triggerIcebergTrajectoryEvent,
    reassessRoute,
    acceptReroute,
    navigatePage,
    candidateRoutes,
    activeRouteId
  } = useAppState();

  const activeRoute = candidateRoutes.find((r) => r.id === activeRouteId) || candidateRoutes[0];
  const recRoute = candidateRoutes.find((r) => r.status === 'RECOMMENDED') || candidateRoutes.find((r) => r.id !== activeRouteId);
  const activeLabel = activeRoute ? activeRoute.name : 'Route A';
  const recLabel = recRoute ? recRoute.name : 'Route B';

  return (
    <div className="modal-backdrop">
      <div className="demo-modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">DEMO SCENARIO CONTROL</h2>
            <p className="modal-sub">Antarctic Iceberg Trajectory Alteration & Instant Reroute Simulation</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="scenario-step-card">
            <div className="step-num">STAGE 1</div>
            <div className="step-content">
              <h3>Simulate Iceberg Trajectory Change (IB-042 Shift)</h3>
              <p>Triggers Sentinel-1 SAR orbit pass observation showing IB-042 drifting directly toward active {activeLabel}.</p>
              <button
                className={`btn-action ${icebergEventTriggered ? 'done' : 'trigger'}`}
                disabled={icebergEventTriggered}
                onClick={() => {
                  triggerIcebergTrajectoryEvent();
                  navigatePage('alerts');
                }}
              >
                {icebergEventTriggered ? (
                  <>
                    <CheckCircle size={16} /> TRAJECTORY SHIFT SIMULATED
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} /> SIMULATE ICEBERG TRAJECTORY CHANGE
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="scenario-step-card">
            <div className="step-num">STAGE 2</div>
            <div className="step-content">
              <h3>Re-evaluate Risk & Calculate {recLabel}</h3>
              <p>Executes A* multi-criteria grid routing engine to calculate optimal low-risk bypass route.</p>
              <button
                className={`btn-action ${rerouteCalculated ? 'done' : 'reassess'}`}
                disabled={!icebergEventTriggered || rerouteCalculated}
                onClick={() => {
                  reassessRoute();
                  navigatePage('alerts');
                }}
              >
                {rerouteCalculated ? (
                  <>
                    <CheckCircle size={16} /> {recLabel} RE-CALCULATED
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} /> RE-EVALUATE NAVIGATION RISK
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="scenario-step-card">
            <div className="step-num">STAGE 3</div>
            <div className="step-content">
              <h3>Accept Reroute (Activate {recLabel})</h3>
              <p>Alters INSV POLARIS active voyage navigation track to {recLabel}.</p>
              <button
                className={`btn-action ${rerouteAccepted ? 'done' : 'accept'}`}
                disabled={!rerouteCalculated || rerouteAccepted}
                onClick={() => {
                  acceptReroute();
                  navigatePage('dashboard');
                  onClose();
                }}
              >
                {rerouteAccepted ? (
                  <>
                    <CheckCircle size={16} /> {recLabel} ACTIVE & VOYAGE RESTORED
                  </>
                ) : (
                  <>
                    <Play size={16} /> ACCEPT REROUTE TO {recLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
