import React from 'react';
import { useAppState } from '../../context/StateContext';
import { VESSELS } from '../../data/mockData';
import { Ship, CheckCircle2, ArrowRight } from 'lucide-react';

export const VesselSelection: React.FC = () => {
  const { selectedVessel, selectVessel, confirmVessel } = useAppState();

  const handleContinue = () => {
    if (selectedVessel) {
      confirmVessel();
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-header-panel">
        <div className="setup-eyebrow">STEP 1 OF 5 — VESSEL CONFIGURATION</div>
        <h1 className="setup-title">SELECT RESEARCH VESSEL</h1>
        <p className="setup-subtitle">
          «Configure vessel characteristics to calculate vessel-specific navigation risk and clearance requirements.»
        </p>
      </div>

      <div className="vessel-grid">
        {VESSELS.map((vessel) => {
          const isSelected = selectedVessel?.id === vessel.id;

          return (
            <div
              key={vessel.id}
              className={`vessel-card ${isSelected ? 'selected' : ''}`}
              onClick={() => selectVessel(vessel)}
            >
              {isSelected && (
                <div className="selected-badge">
                  <CheckCircle2 size={16} /> SELECTED
                </div>
              )}

              <div className="vessel-icon-header">
                <div className="vessel-avatar">
                  <Ship size={32} />
                </div>
                <div>
                  <span className="vessel-type-label">{vessel.type}</span>
                  <h3 className="vessel-name">{vessel.name}</h3>
                </div>
              </div>

              <p className="vessel-desc">{vessel.description}</p>

              <div className="vessel-specs-list">
                <div className="spec-item">
                  <span className="spec-label">DRAFT</span>
                  <strong className="spec-value">{vessel.draft} m</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">CRUISING SPEED</span>
                  <strong className="spec-value">{vessel.cruisingSpeed} kn</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">MANEUVERABILITY</span>
                  <strong className="spec-value">{vessel.maneuverability}</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">ICE CAPABILITY</span>
                  <strong className="spec-value highlight">{vessel.iceCapability}</strong>
                </div>
              </div>

              <div className="vessel-card-footer">
                <span>Hull Clearance: {(vessel.draft * 1.5).toFixed(1)}m req.</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="setup-actions">
        <button
          className="btn-primary-glow"
          disabled={!selectedVessel}
          onClick={handleContinue}
        >
          CONTINUE TO DESTINATION <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
