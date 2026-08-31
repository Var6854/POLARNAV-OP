import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { ShieldAlert, AlertTriangle, Activity, Zap } from 'lucide-react';

export const IcebergPage: React.FC = () => {
  const { icebergs, icebergEventTriggered } = useAppState();
  const [selectedIbId, setSelectedIbId] = useState<string>('IB-042');

  const selectedIb = icebergs.find((ib) => ib.id === selectedIbId) || icebergs[0];
  const isSelectedIbCritical = selectedIb?.status === 'CRITICAL';

  return (
    <div className="page-container iceberg-page">
      <div className="page-header-box">
        <div className="page-title-row" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ShieldAlert className="text-cyan-400" size={24} />
            <div>
              <h1>ICEBERG INTELLIGENCE & TRAJECTORY MONITOR</h1>
              <p>Real-time tracked tabular icebergs, submerged keel depth profiles, and dynamic SAR drift kinetic streams.</p>
            </div>
          </div>
          <div
            style={{
              background: icebergEventTriggered ? 'rgba(225, 29, 72, 0.1)' : 'rgba(2, 132, 199, 0.1)',
              border: `1px solid ${icebergEventTriggered ? '#e11d48' : 'rgba(2, 132, 199, 0.4)'}`,
              padding: '6px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontWeight: 700,
              color: icebergEventTriggered ? '#e11d48' : '#0284c7'
            }}
          >
            <Activity size={14} className="animate-pulse" />
            {icebergEventTriggered ? '⚠ CRITICAL HAZARD DRIFT SURGE ACTIVE' : 'DYNAMIC OCEAN CURRENT DRIFT TELEMETRY ACTIVE'}
          </div>
        </div>
      </div>

      <div className="iceberg-layout-grid">
        <div className="iceberg-table-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3>TRACKED ICEBERG HAZARD REGISTRY</h3>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
              <Zap size={12} className="inline text-amber-500 mr-1" />
              Live SAR Kinetic Updates (Every 2s)
            </span>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>STATUS</th>
                  <th>COORDINATES</th>
                  <th>DYNAMIC DRIFT SPEED</th>
                  <th>HAZARD RADIUS</th>
                  <th>CONFIDENCE</th>
                </tr>
              </thead>
              <tbody>
                {icebergs.map((ib) => {
                  const isSelected = ib.id === selectedIbId;
                  const isCritical = ib.status === 'CRITICAL';

                  return (
                    <tr
                      key={ib.id}
                      className={`${isSelected ? 'selected-row' : ''} ${isCritical ? 'critical-row' : ''}`}
                      onClick={() => setSelectedIbId(ib.id)}
                    >
                      <td>
                        <strong>{ib.id}</strong>
                      </td>
                      <td>{ib.name}</td>
                      <td>
                        <span className={`status-pill ${ib.status.toLowerCase()}`}>{ib.status}</span>
                      </td>
                      <td>
                        {ib.lat.toFixed(2)}°S {Math.abs(ib.lng).toFixed(2)}°W
                      </td>
                      <td>
                        <span
                          style={{
                            background: isCritical ? 'rgba(225, 29, 72, 0.12)' : 'rgba(2, 132, 199, 0.1)',
                            color: isCritical ? '#e11d48' : '#0284c7',
                            border: `1px solid ${isCritical ? '#e11d48' : 'rgba(2, 132, 199, 0.3)'}`,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Activity size={10} className="animate-pulse" />
                          {ib.driftSpeed.toFixed(2)} m/s ({ib.headingLabel})
                        </span>
                      </td>
                      <td>{ib.hazardRadius} km</td>
                      <td>{ib.confidence}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="iceberg-detail-sidebar">
          {selectedIb && (
            <div className="ib-detail-card">
              <div className="ib-detail-header">
                <span className={`status-pill ${selectedIb.status.toLowerCase()}`}>{selectedIb.status}</span>
                <h2>{selectedIb.name}</h2>
                <span className="source-tag">{selectedIb.source}</span>
              </div>

              <div className="ib-spec-grid">
                <div className="spec">
                  <span className="lbl">DYNAMIC DRIFT SPEED</span>
                  <strong
                    className={`val ${isSelectedIbCritical ? 'text-rose-500' : 'text-cyan-400'}`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    ⚡ {selectedIb.driftSpeed.toFixed(2)} m/s
                  </strong>
                </div>
                <div className="spec">
                  <span className="lbl">KEEL DEPTH</span>
                  <strong className="val text-amber-500">{selectedIb.keelDepth} m</strong>
                </div>
                <div className="spec">
                  <span className="lbl">SURFACE SIZE</span>
                  <strong className="val">{selectedIb.estimatedSize} km</strong>
                </div>
                <div className="spec">
                  <span className="lbl">DRIFT HEADING</span>
                  <strong className="val">{selectedIb.driftHeading}° ({selectedIb.headingLabel})</strong>
                </div>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-card)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: 'var(--text-muted)'
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  🌊 OCEANOGRAPHIC KINETICS
                </span>
                {isSelectedIbCritical
                  ? '⚠ CRITICAL DRIFT ACCELERATION: IB-042 drift velocity surged due to Antarctic Coastal Current shear and wind drag.'
                  : 'Drift velocity dynamically fluctuates in normal range based on ocean currents (80% weight) and wind drag (20% weight).'}
              </div>

              {selectedIb.id === 'IB-042' && icebergEventTriggered && (
                <div className="ib-alert-callout" style={{ marginTop: '12px' }}>
                  <AlertTriangle size={18} className="text-rose-400" />
                  <div>
                    <strong>CRITICAL DRIFT VECTOR SHIFT DETECTED</strong>
                    <p>
                      Sentinel-1B pass confirmed IB-042 altered heading toward 135° SE with accelerated dynamic drift speed ({selectedIb.driftSpeed.toFixed(2)} m/s). Route A clearance is reduced to &lt;1.5 km.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
