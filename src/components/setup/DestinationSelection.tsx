import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { SUGGESTED_DESTINATIONS } from '../../data/mockData';
import type { LocationPoint } from '../../types';
import { PolarMap } from '../map/PolarMap';
import { MapPin, ArrowRight, CheckCircle2, Compass } from 'lucide-react';

export const DestinationSelection: React.FC = () => {
  const {
    selectedVessel,
    origin,
    destination,
    selectDestination,
    confirmDestination,
    icebergs
  } = useAppState();

  const [customPoint, setCustomPoint] = useState<LocationPoint | null>(null);

  const activeDest = customPoint || destination || SUGGESTED_DESTINATIONS[0];

  const handleMapClick = (lat: number, lng: number) => {
    const customLoc: LocationPoint = {
      name: `Custom Target Point (${lat.toFixed(2)}°S, ${Math.abs(lng).toFixed(2)}°W)`,
      lat,
      lng,
      description: 'Operator Selected Antarctic Coordinate Point',
      isCustom: true
    };
    setCustomPoint(customLoc);
    selectDestination(customLoc);
  };

  const handlePickSuggested = (loc: LocationPoint) => {
    setCustomPoint(null);
    selectDestination(loc);
  };

  return (
    <div className="setup-container">
      <div className="setup-header-panel">
        <div className="setup-eyebrow">STEP 2 OF 5 — MISSION OBJECTIVE</div>
        <h1 className="setup-title">SELECT DESTINATION</h1>
        <p className="setup-subtitle">
          Click anywhere on the Antarctic map or choose a suggested science station to establish voyage destination.
        </p>
      </div>

      <div className="dest-split-grid">
        <div className="suggested-sidebar">
          <div className="origin-preset-box">
            <span className="box-label">ORIGIN (PRESET)</span>
            <div className="location-item origin">
              <Compass size={18} className="text-cyan-400" />
              <div>
                <strong>{origin.name}</strong>
                <small>
                  {origin.lat.toFixed(2)}°S {Math.abs(origin.lng).toFixed(2)}°W
                </small>
              </div>
            </div>
          </div>

          <div className="suggested-list-container">
            <span className="box-label">SUGGESTED RESEARCH STATIONS</span>
            {SUGGESTED_DESTINATIONS.map((loc) => {
              const isSelected = !customPoint && destination?.name === loc.name;

              return (
                <div
                  key={loc.name}
                  className={`suggested-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePickSuggested(loc)}
                >
                  <div className="suggested-header">
                    <MapPin size={16} className={isSelected ? 'text-emerald-400' : 'text-slate-400'} />
                    <strong>{loc.name}</strong>
                    {isSelected && <CheckCircle2 size={16} className="text-emerald-400 ml-auto" />}
                  </div>
                  <p className="suggested-desc">{loc.description}</p>
                  <div className="suggested-coords">
                    {loc.lat.toFixed(2)}°S {Math.abs(loc.lng).toFixed(2)}°W
                  </div>
                </div>
              );
            })}
          </div>

          {activeDest && (
            <div className="dest-confirmed-card">
              <span className="badge-confirmed">✓ DESTINATION SELECTED</span>
              <h3 className="dest-name">{activeDest.name}</h3>
              <div className="dest-coords-big">
                <span>{activeDest.lat.toFixed(2)}°S</span>
                <span>{Math.abs(activeDest.lng).toFixed(2)}°W</span>
              </div>
              <button
                className="btn-primary-glow"
                style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}
                onClick={confirmDestination}
              >
                ANALYZE ROUTE <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="map-selection-wrapper">
          <PolarMap
            vessel={selectedVessel}
            origin={origin}
            destination={activeDest}
            icebergs={icebergs}
            candidateRoutes={[]}
            activeRouteId="a"
            vesselProgressPercent={0}
            allowMapClickDestination={true}
            onSelectDestinationClick={handleMapClick}
          />
        </div>
      </div>

      <div className="setup-actions">
        <button
          className="btn-primary-glow"
          disabled={!activeDest}
          onClick={confirmDestination}
        >
          ANALYZE ROUTE <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
