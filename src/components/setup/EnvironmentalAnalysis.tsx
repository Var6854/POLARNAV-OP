import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { Radio, ShieldAlert, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';

export const EnvironmentalAnalysis: React.FC = () => {
  const {
    selectedVessel,
    origin,
    destination,
    environment,
    icebergs,
    finishEnvironmentalAnalysis
  } = useAppState();

  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScanStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(timer);
  }, []);

  const scanItems = [
    { title: 'Sentinel-1 SAR Radar Passes', detail: 'Ingesting dual-pol VV/VH backscatter grids (10m resolution)' },
    { title: 'Ice Concentration Fields', detail: `Weddell Sea mean ice pack: ${environment.seaIceConcentrationAvg}%` },
    { title: 'Iceberg Trajectory Models', detail: `${icebergs.length} iceberg hazards tracked (IB-042, IB-019, IB-088)` },
    { title: 'Ocean Current Dynamics', detail: `${environment.oceanCurrentSpeed} m/s ${environment.oceanCurrentDirection} drift vector` },
    { title: 'Vessel Hull Risk Constraint', detail: `${selectedVessel?.name} draft ${selectedVessel?.draft}m clearance` },
    { title: 'A* Risk Surface Mesh', detail: 'Generating multi-criteria cost matrix...' }
  ];

  return (
    <div className="setup-container">
      <div className="setup-header-panel">
        <div className="setup-eyebrow">STEP 3 OF 5 — INTELLIGENCE SCANNING</div>
        <h1 className="setup-title">ENVIRONMENTAL INTELLIGENCE SCAN</h1>
        <p className="setup-subtitle">
          PolarNav is aggregating live satellite observations, sea-ice drift vectors, and iceberg trajectories.
        </p>
      </div>

      <div className="scan-layout-grid">
        <div className="scan-progress-panel">
          <div className="scan-header-status">
            <Radio className="animate-pulse text-cyan-400" size={20} />
            <span>SATELLITE DATA FUSION ACTIVE ({Math.min(100, Math.round((scanStep / 6) * 100))}%)</span>
          </div>

          <div className="scan-steps-list">
            {scanItems.map((item, idx) => {
              const isCompleted = scanStep > idx;
              const isScanning = scanStep === idx;

              return (
                <div
                  key={idx}
                  className={`scan-step-card ${isCompleted ? 'completed' : ''} ${isScanning ? 'scanning' : ''}`}
                >
                  <div className="scan-step-icon">
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : isScanning ? (
                      <Cpu size={18} className="text-cyan-400 animate-spin" />
                    ) : (
                      <div className="dot-idle" />
                    )}
                  </div>

                  <div className="scan-step-text">
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="scan-summary-sidebar">
          <div className="summary-box">
            <span className="box-label">MISSION PARAMETERS</span>
            <div className="summary-row">
              <span>Vessel:</span>
              <strong>{selectedVessel?.name}</strong>
            </div>
            <div className="summary-row">
              <span>Origin:</span>
              <strong>{origin.name}</strong>
            </div>
            <div className="summary-row">
              <span>Destination:</span>
              <strong>{destination?.name}</strong>
            </div>
          </div>

          <div className="summary-box environment">
            <span className="box-label">ENVIRONMENTAL TELEMETRY</span>
            <div className="env-grid-mini">
              <div className="env-card-mini">
                <span className="lbl">Sea Ice</span>
                <span className="val">{environment.seaIceConcentrationAvg}%</span>
              </div>
              <div className="env-card-mini">
                <span className="lbl">Wind</span>
                <span className="val">{environment.windSpeedKnots} kn</span>
              </div>
              <div className="env-card-mini">
                <span className="lbl">Wave</span>
                <span className="val">{environment.waveHeightMeters} m</span>
              </div>
              <div className="env-card-mini">
                <span className="lbl">Visibility</span>
                <span className="val">{environment.visibilityKm} km</span>
              </div>
            </div>
          </div>

          <div className="scan-notice-card">
            <ShieldAlert size={20} className="text-cyan-400" />
            <p>
              A* risk matrix initialized. Next step generates candidate routes avoiding high-concentration ice fields.
            </p>
          </div>
        </div>
      </div>

      <div className="setup-actions">
        <button
          className="btn-primary-glow"
          disabled={scanStep < 6}
          onClick={finishEnvironmentalAnalysis}
        >
          GENERATE CANDIDATE ROUTES <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
