import React from 'react';
import { useAppState } from '../../context/StateContext';
import type { PageId } from '../../types';
import { LayoutDashboard, Layers, ShieldAlert, Route, AlertTriangle } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activePage, navigatePage, alertActive } = useAppState();

  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'sea_ice', label: 'Sea Ice Analysis', icon: <Layers size={18} /> },
    { id: 'icebergs', label: 'Iceberg Intel', icon: <ShieldAlert size={18} /> },
    { id: 'routes', label: 'Route Intelligence', icon: <Route size={18} /> },
    {
      id: 'alerts',
      label: 'Alerts & Reroute',
      icon: <AlertTriangle size={18} />,
      badge: alertActive ? '1 ACTION' : undefined
    }
  ];

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''} ${item.id === 'alerts' && alertActive ? 'alert-pulse-nav' : ''}`}
              onClick={() => navigatePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>

              {item.badge && (
                <span className={`nav-badge ${alertActive ? 'badge-danger' : 'badge-neutral'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer-box">
        <div className="telemetry-item">
          <span className="t-label">SAR ORBIT PASS</span>
          <span className="t-val text-emerald-400">ACTIVE (Sentinel-1B)</span>
        </div>
        <div className="telemetry-item">
          <span className="t-label">RISK ENGINE</span>
          <span className="t-val text-cyan-400">A* GRID v2.4</span>
        </div>
      </div>
    </aside>
  );
};
