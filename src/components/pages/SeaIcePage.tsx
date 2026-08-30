import React from 'react';
import { useAppState } from '../../context/StateContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Layers, Thermometer, Wind, Eye } from 'lucide-react';

export const SeaIcePage: React.FC = () => {
  const { environment } = useAppState();

  const chartData = [
    { time: '00:00', concentration: 28, drift: 2.1 },
    { time: '04:00', concentration: 30, drift: 2.8 },
    { time: '08:00', concentration: 32, drift: 3.5 },
    { time: '12:00', concentration: 36, drift: 4.8 },
    { time: '16:00', concentration: 42, drift: 6.2 },
    { time: '20:00', concentration: 46, drift: 7.9 },
    { time: '24:00', concentration: 50, drift: 9.4 }
  ];

  return (
    <div className="page-container sea-ice-page">
      <div className="page-header-box">
        <div className="page-title-row">
          <Layers className="text-cyan-400" size={24} />
          <div>
            <h1>SEA ICE ANALYSIS & DYNAMICS</h1>
            <p>Sentinel-1 SAR Dual-Pol Backscatter & Sea Ice Concentration Field Analysis</p>
          </div>
        </div>
      </div>

      <div className="env-metrics-grid">
        <div className="env-card">
          <span className="env-lbl">MEAN ICE CONCENTRATION</span>
          <h2 className="env-val text-cyan-400">{environment.seaIceConcentrationAvg}%</h2>
          <small>Sentinel-1 SAR Radar Analysis</small>
        </div>

        <div className="env-card">
          <span className="env-lbl">WIND SPEED & VECTOR</span>
          <h2 className="env-val text-amber-400">{environment.windSpeedKnots} kn</h2>
          <small>Direction: {environment.windDirection} (SSW)</small>
        </div>

        <div className="env-card">
          <span className="env-lbl">OCEAN CURRENT DRIFT</span>
          <h2 className="env-val text-emerald-400">{environment.oceanCurrentSpeed} m/s</h2>
          <small>Direction: {environment.oceanCurrentDirection} (NE)</small>
        </div>

        <div className="env-card">
          <span className="env-lbl">VISIBILITY RANGE</span>
          <h2 className="env-val text-sky-400">{environment.visibilityKm} km</h2>
          <small>Surface Air Temp: {environment.temperatureC}°C</small>
        </div>
      </div>

      <div className="chart-panel">
        <h3>24-HOUR SEA ICE CONCENTRATION FORECAST</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#0f172a', borderColor: '#0284c7', borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="concentration" stroke="#38bdf8" fill="#0284c7" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
