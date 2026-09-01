import React from 'react';
import { useAppState } from '../../context/StateContext';
import { Shield, AlertTriangle, Radio, Play, RotateCcw, Clock, Sun, Moon } from 'lucide-react';

export const Header: React.FC<{ onOpenDemoControl: () => void }> = ({ onOpenDemoControl }) => {
  const {
    theme,
    backendOnline,
    toggleTheme,
    currentStep,
    selectedVessel,
    activeRouteId,
    candidateRoutes,
    alertActive,
    simulationTimeMinutes,
    resetDemo
  } = useAppState();

  const activeRoute = candidateRoutes.find((r) => r.id === activeRouteId) || candidateRoutes[0];
  const isVoyageActive = currentStep === 'VOYAGE_ACTIVE';

  const formatSimTime = (mins: number) => {
    const hrs = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${hrs.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} UTC`;
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">
          <Shield className="text-cyan-400" size={24} />
        </div>
        <div className="brand-titles">
          <h1 className="brand-name">POLARNAV</h1>
          <span className="brand-sub">ANTARCTIC MARITIME INTELLIGENCE</span>
        </div>
      </div>

      <div className="header-status-strip">
        <div className="status-item">
          <span className="status-label">VESSEL</span>
          <strong className="status-value highlight">{selectedVessel ? selectedVessel.name : 'UNSELECTED'}</strong>
        </div>

        <div className="status-divider" />

        <div className="status-item">
          <span className="status-label">ACTIVE ROUTE</span>
          <strong className="status-value">
            {isVoyageActive && activeRoute ? `${activeRoute.name} (${activeRoute.distanceKm} km)` : 'NONE (CONFIGURING)'}
          </strong>
        </div>

        <div className="status-divider" />

        <div className="status-item">
          <span className="status-label">RISK STATUS</span>
          <span
            className={`status-badge ${
              alertActive
                ? 'badge-alert'
                : activeRoute?.riskCategory === 'HIGH'
                ? 'badge-warning'
                : 'badge-ok'
            }`}
          >
            {alertActive ? (
              <>
                <AlertTriangle size={12} /> CRITICAL (84/100)
              </>
            ) : (
              <>
                <Radio size={12} /> {activeRoute?.riskCategory || 'LOW'} ({activeRoute?.riskScore || 22}/100)
              </>
            )}
          </span>
        </div>

        <div className="status-divider" />

        <div className="status-item">
          <span className="status-label">SIM TIME</span>
          <strong className="status-value mono">
            <Clock size={12} className="inline mr-1 text-cyan-400" />
            {formatSimTime(simulationTimeMinutes)}
          </strong>
        </div>

        <div className="status-divider" />

        <div className="status-item">
          <span className="status-label">ML BACKEND</span>
          <span className={`status-badge ${backendOnline ? 'badge-ok' : 'badge-warning'}`}>
            <Radio size={12} className={backendOnline ? 'animate-pulse' : ''} />
            {backendOnline ? 'FLASK ML: ONLINE' : 'FLASK ML: LOCAL'}
          </span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === 'light' ? 'DARK' : 'LIGHT'}</span>
        </button>

        {isVoyageActive && (
          <button className="btn-demo-trigger" onClick={onOpenDemoControl}>
            <Play size={14} /> DEMO CONTROLS
          </button>
        )}

        <button className="btn-icon-secondary" onClick={resetDemo} title="Reset Voyage Demo">
          <RotateCcw size={16} /> RESET
        </button>
      </div>
    </header>
  );
};
