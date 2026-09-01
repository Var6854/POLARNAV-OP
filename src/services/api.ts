import type { Vessel, LocationPoint, Iceberg, EnvironmentalState, CandidateRoute } from '../types';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  return 'https://polarnav-op-api.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: string;
  models_loaded: {
    iceberg_classifier: boolean;
    drift_regressor: boolean;
    risk_regressor: boolean;
  };
}

export async function fetchHealth(): Promise<HealthCheckResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await response.json();
  } catch (err) {
    console.warn('[POLARNAV API] Health check failed:', err);
    return null;
  }
}

export async function predictDriftApi(iceberg: Partial<Iceberg>, environment: Partial<EnvironmentalState>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict-drift`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iceberg, environment })
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await response.json();
  } catch (err) {
    console.error('[POLARNAV API] predictDrift error:', err);
    return null;
  }
}

export async function predictRiskApi(params: Record<string, any>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await response.json();
  } catch (err) {
    console.error('[POLARNAV API] predictRisk error:', err);
    return null;
  }
}

export async function classifyIceApi(features: Record<string, any>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classify-ice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features)
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await response.json();
  } catch (err) {
    console.error('[POLARNAV API] classifyIce error:', err);
    return null;
  }
}

export async function generateRoutesApi(
  vessel: Vessel | null,
  origin: LocationPoint,
  destination: LocationPoint | null,
  icebergs: Iceberg[],
  environment: EnvironmentalState
): Promise<CandidateRoute[] | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vessel, origin, destination, icebergs, environment })
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await response.json();
  } catch (err) {
    console.error('[POLARNAV API] generateRoutes error:', err);
    return null;
  }
}

export async function reassessRouteApi(
  vessel: Vessel | null,
  origin: LocationPoint,
  destination: LocationPoint | null,
  icebergs: Iceberg[],
  environment: EnvironmentalState,
  activeRouteId: string = 'a'
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reassess-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vessel, origin, destination, icebergs, environment, active_route_id: activeRouteId })
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await response.json();
  } catch (err) {
    console.error('[POLARNAV API] reassessRoute error:', err);
    return null;
  }
}

export async function simulateIcebergApi(icebergId: string = 'IB-042', activeRouteId: string = 'a') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/simulate-iceberg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iceberg_id: icebergId, active_route_id: activeRouteId })
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await response.json();
  } catch (err) {
    console.error('[POLARNAV API] simulateIceberg error:', err);
    return null;
  }
}

export async function mcdaRankApi(routes: CandidateRoute[], weights?: Record<string, number>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mcda-rank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routes, weights })
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await response.json();
  } catch (err) {
    console.error('[POLARNAV API] mcdaRank error:', err);
    return null;
  }
}
