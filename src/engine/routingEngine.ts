import type { Vessel, LocationPoint, Iceberg, EnvironmentalState, CandidateRoute } from '../types';
import { calculateRouteRisk, haversineDistanceKm } from './riskEngine';

function interpolateWaypoints(controlPoints: [number, number][], pointsPerSegment: number = 3): [number, number][] {
  const waypoints: [number, number][] = [];
  
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const p1 = controlPoints[i];
    const p2 = controlPoints[i + 1];

    for (let j = 0; j < pointsPerSegment; j++) {
      const t = j / pointsPerSegment;
      const lat = p1[0] + (p2[0] - p1[0]) * t;
      const lng = p1[1] + (p2[1] - p1[1]) * t;
      waypoints.push([Number(lat.toFixed(4)), Number(lng.toFixed(4))]);
    }
  }

  waypoints.push(controlPoints[controlPoints.length - 1]);
  return waypoints;
}

export function calculateTotalRouteDistanceKm(waypoints: [number, number][]): number {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += haversineDistanceKm(
      waypoints[i][0],
      waypoints[i][1],
      waypoints[i + 1][0],
      waypoints[i + 1][1]
    );
  }
  return Math.round(total);
}

export function generateCandidateRoutes(
  vessel: Vessel,
  origin: LocationPoint,
  destination: LocationPoint,
  icebergs: Iceberg[],
  environment: EnvironmentalState
): CandidateRoute[] {
  const startPt: [number, number] = [origin.lat, origin.lng];
  const endPt: [number, number] = [destination.lat, destination.lng];

  // ROUTE A (Shortest Open Ocean Channel — Antarctic Sound Passage)
  const controlA: [number, number][] = [
    startPt,
    [-62.45, -58.20],
    [-62.65, -57.10],
    [-62.90, -56.70], // IB-042 shifted marker & trajectory lie EXACTLY here!
    [-63.30, -56.70],
    [-63.65, -57.10],
    endPt
  ];
  const waypointsA = interpolateWaypoints(controlA, 3);

  // ROUTE B (Safer Deep Eastern Ocean Arc — Bypasses IB-042 and Heavy Ice Pack by 80+ km)
  const controlB: [number, number][] = [
    startPt,
    [-62.30, -57.20],
    [-62.60, -55.80],
    [-63.10, -55.50],
    [-63.60, -56.20],
    endPt
  ];
  const waypointsB = interpolateWaypoints(controlB, 3);

  // ROUTE C (Western Outer Shelf Channel)
  const controlC: [number, number][] = [
    startPt,
    [-62.60, -59.80],
    [-63.20, -60.80],
    [-63.90, -60.20],
    [-64.20, -58.50],
    endPt
  ];
  const waypointsC = interpolateWaypoints(controlC, 3);

  const riskA = calculateRouteRisk(vessel, waypointsA, icebergs, environment);
  const riskB = calculateRouteRisk(vessel, waypointsB, icebergs, environment);
  const riskC = calculateRouteRisk(vessel, waypointsC, icebergs, environment);

  const distA = calculateTotalRouteDistanceKm(waypointsA);
  const distB = calculateTotalRouteDistanceKm(waypointsB);
  const distC = calculateTotalRouteDistanceKm(waypointsC);

  const speed = vessel.cruisingSpeed || 12;
  const kmh = speed * 1.852;

  const etaA = Math.round((distA / kmh) * 10) / 10;
  const etaB = Math.round((distB / kmh) * 10) / 10;
  const etaC = Math.round((distC / kmh) * 10) / 10;

  const baseFuelRate = vessel.fuelConsumptionRate || 21.0;
  const fuelA = Math.round(distA * baseFuelRate);
  const fuelB = Math.round(distB * baseFuelRate);
  const fuelC = Math.round(distC * baseFuelRate);

  const isAHighRisk = riskA.overallRiskScore >= 55;

  const routeA: CandidateRoute = {
    id: 'a',
    name: 'ROUTE A — SHORTEST',
    tag: 'Antarctic Sound Ocean Corridor',
    distanceKm: distA,
    etaHours: etaA,
    fuelLiters: fuelA,
    riskCategory: riskA.category,
    riskScore: riskA.overallRiskScore,
    waypoints: waypointsA,
    seaIceExposure: 'Low',
    icebergExposure: isAHighRisk ? 'Severe' : 'Minimal',
    status: isAHighRisk ? 'AVOID' : 'RECOMMENDED',
    description: isAHighRisk
      ? 'CRITICAL EXPOSURE: IB-042 shifted trajectory directly intersects Route A corridor in Antarctic Sound.'
      : 'Route A provides the best overall balance between distance, fuel, time, and estimated environmental risk through open sea water.',
    costBreakdown: {
      distance: 35,
      seaIce: riskA.components.seaIceRisk,
      iceberg: riskA.components.icebergRisk,
      weather: riskA.components.weatherRisk,
      vesselDraft: riskA.components.vesselHazard
    }
  };

  const routeB: CandidateRoute = {
    id: 'b',
    name: 'ROUTE B — SAFER',
    tag: 'Outer Eastern Deep Ocean Bypass',
    distanceKm: distB,
    etaHours: etaB,
    fuelLiters: fuelB,
    riskCategory: riskB.category,
    riskScore: riskB.overallRiskScore,
    waypoints: waypointsB,
    seaIceExposure: 'Low',
    icebergExposure: 'Minimal',
    status: isAHighRisk ? 'RECOMMENDED' : 'ACCEPTABLE',
    description: isAHighRisk
      ? 'RECOMMENDED ALTERNATIVE: Bypasses IB-042 hazard zone by 80+ km in deep outer sea water.'
      : 'Alternative outer sea corridor providing maximum clearance from tabular iceberg drift zones.',
    costBreakdown: {
      distance: 52,
      seaIce: riskB.components.seaIceRisk,
      iceberg: riskB.components.icebergRisk,
      weather: riskB.components.weatherRisk,
      vesselDraft: riskB.components.vesselHazard
    }
  };

  const routeC: CandidateRoute = {
    id: 'c',
    name: 'ROUTE C — BALANCED',
    tag: 'Western Outer Shelf Passage',
    distanceKm: distC,
    etaHours: etaC,
    fuelLiters: fuelC,
    riskCategory: riskC.category,
    riskScore: riskC.overallRiskScore,
    waypoints: waypointsC,
    seaIceExposure: 'Moderate',
    icebergExposure: 'Moderate',
    status: 'SECONDARY',
    description: 'Western coastal shelf route with moderate sea-ice concentration along continental edge.',
    costBreakdown: {
      distance: 44,
      seaIce: riskC.components.seaIceRisk,
      iceberg: riskC.components.icebergRisk,
      weather: riskC.components.weatherRisk,
      vesselDraft: riskC.components.vesselHazard
    }
  };

  return [routeA, routeB, routeC];
}
