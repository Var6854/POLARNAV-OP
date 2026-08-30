import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { ShieldAlert, AlertTriangle, Compass, Radio } from 'lucide-react';

export const IcebergPage: React.FC = () => {
  const { icebergs, icebergEventTriggered } = useAppState();
  const [selectedIbId, setSelectedIbId] = useState<string>('IB-042');

  const selectedIb = icebergs.find((ib) => ib.id === selectedIbId) || icebergs[0];

  return (
    <div className="page-container iceberg-page">
      <div className="page-header-box">
        <div className="page-title-row">
          <ShieldAlert className="text-cyan-400" size={24} />
          <div>
            <h1>ICEBERG INTELLIGENCE & TRAJECTORY MONITOR</h1>
            <p>Real-time tracked tabular icebergs, submerged keel depth profiles, and uncertainty corridors.</p>
          </div>
        </div>
      </div>

      <div className="iceberg-layout-grid">
        <div className="iceberg-table-card">
          <h3>TRACKED ICEBERG HAZARD REGISTRY</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>STATUS</th>
                  <th>COORDINATES</th>
                  <th>DRIFT SPEED</th>
                  <th>HAZARD RADIUS</th>
                  <th>CONFIDENCE</th>
                </tr>
              </thead>
              <tbody>
                {icebergs.map((ib) => {
                  const isSelected = ib.id === selectedIbId;
                  const isCritical = ib.status === 'CRITICAL' || ib.status === 'WATCH';

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
                      <td>{ib.driftSpeed} m/s ({ib.headingLabel})</td>
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
                  <span className="lbl">KEEL DEPTH</span>
                  <strong className="val text-cyan-400">{selectedIb.keelDepth} m</strong>
                </div>
                <div className="spec">
                  <span className="lbl">SURFACE SIZE</span>
                  <strong className="val">{selectedIb.estimatedSize} km</strong>
                </div>
                <div className="spec">
                  <span className="lbl">DRIFT HEADING</span>
                  <strong className="val">{selectedIb.driftHeading}° ({selectedIb.headingLabel})</strong>
                </div>
                <div className="spec">
                  <span className="lbl">HAZARD CLEARANCE</span>
                  <strong className="val text-amber-400">{selectedIb.hazardRadius} km</strong>
                </div>
              </div>

              {selectedIb.id === 'IB-042' && icebergEventTriggered && (
                <div className="ib-alert-callout">
                  <AlertTriangle size={18} className="text-rose-400" />
                  <div>
                    <strong>CRITICAL DRIFT VECTOR SHIFT DETECTED</strong>
                    <p>
                      Sentinel-1B pass confirmed IB-042 altered heading toward 135° SE. Submerged keel clearance on Route A is reduced to &lt;1.5 km.
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
