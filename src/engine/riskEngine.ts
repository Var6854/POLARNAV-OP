import type { Vessel, Iceberg, EnvironmentalState, RiskAssessmentDetails } from '../types';

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function pointToRouteDistanceKm(point: [number, number], routeWaypoints: [number, number][]): number {
  if (!routeWaypoints || routeWaypoints.length === 0) return 999;
  let minDistance = Infinity;

  for (let i = 0; i < routeWaypoints.length - 1; i++) {
    const p1 = routeWaypoints[i];
    const p2 = routeWaypoints[i + 1];

    const d1 = haversineDistanceKm(point[0], point[1], p1[0], p1[1]);
    const d2 = haversineDistanceKm(point[0], point[1], p2[0], p2[1]);
    const d = Math.min(d1, d2);
    if (d < minDistance) minDistance = d;
  }

  return minDistance;
}

export function calculateRouteRisk(
  vessel: Vessel,
  routeWaypoints: [number, number][],
  icebergs: Iceberg[],
  environment: EnvironmentalState
): RiskAssessmentDetails {
  let closestIcebergDistKm = 999;
  let highestIcebergRiskScore = 0;
  let relevantIceberg: Iceberg | null = null;

  for (const ib of icebergs) {
    const distCurrent = pointToRouteDistanceKm([ib.lat, ib.lng], routeWaypoints);
    let minDistTrajectory = distCurrent;

    for (const trajPt of ib.predictedTrajectory) {
      const dTraj = pointToRouteDistanceKm(trajPt, routeWaypoints);
      if (dTraj < minDistTrajectory) minDistTrajectory = dTraj;
    }

    if (minDistTrajectory < closestIcebergDistKm) {
      closestIcebergDistKm = minDistTrajectory;
      relevantIceberg = ib;
    }

    const hazardRadius = ib.hazardRadius || 3.0;
    const clearance = minDistTrajectory - hazardRadius;

    let ibRiskNorm = 0;
    if (clearance <= 0) {
      ibRiskNorm = 1.0;
    } else if (clearance < 15.0) {
      ibRiskNorm = Math.max(0, 1.0 - clearance / 15.0);
    }
    const statusMult = ib.status === 'CRITICAL' ? 1.2 : ib.status === 'WATCH' ? 1.0 : 0.8;
    const scaledScore = Math.min(1.0, ibRiskNorm * (ib.confidence / 100) * statusMult);

    if (scaledScore > highestIcebergRiskScore) {
      highestIcebergRiskScore = scaledScore;
    }
  }

  const icebergRisk = highestIcebergRiskScore;
  const seaIceRisk = Math.min(1.0, environment.seaIceConcentrationAvg / 100);
  const windScaled = Math.min(1.0, environment.windSpeedKnots / 40.0);
  const visScaled = Math.min(1.0, (10.0 - environment.visibilityKm) / 10.0);
  const weatherRisk = Math.min(1.0, 0.6 * windScaled + 0.4 * visScaled);

  const currentScaled = Math.min(1.0, environment.oceanCurrentSpeed / 2.0);
  const waveScaled = Math.min(1.0, environment.waveHeightMeters / 6.0);
  const oceanRisk = Math.min(1.0, 0.4 * currentScaled + 0.6 * waveScaled);

  const draftScaled = Math.min(1.0, vessel.draft / 12.0);
  const speedRatio = Math.min(1.0, vessel.cruisingSpeed / vessel.maxSpeed);
  const vesselHazard = Math.min(1.0, 0.6 * draftScaled + 0.4 * speedRatio);

  const weightedSum =
    0.35 * icebergRisk +
    0.25 * seaIceRisk +
    0.15 * weatherRisk +
    0.10 * oceanRisk +
    0.15 * vesselHazard;

  const overallRiskScore = Math.round(weightedSum * 100);

  let category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (overallRiskScore >= 75) category = 'CRITICAL';
  else if (overallRiskScore >= 55) category = 'HIGH';
  else if (overallRiskScore >= 35) category = 'MODERATE';

  const clearanceKm = Math.max(0, closestIcebergDistKm - (relevantIceberg?.hazardRadius || 3.0));

  const reasons = {
    icebergRisk: relevantIceberg
      ? `Nearest trajectory conflict (${relevantIceberg.id}) is ${closestIcebergDistKm.toFixed(1)} km from route (Clearance: ${clearanceKm.toFixed(1)} km).`
      : 'No active iceberg trajectory conflicts detected along route corridor.',
    seaIceRisk: `Mean sea-ice concentration is ${environment.seaIceConcentrationAvg}% with estimated drift of ${environment.forecast[1].driftKm} km/12h.`,
    weatherRisk: `Wind speed ${environment.windSpeedKnots} kn (${environment.windDirection}), visibility ${environment.visibilityKm} km.`,
    oceanRisk: `Surface ocean current ${environment.oceanCurrentSpeed} m/s (${environment.oceanCurrentDirection}), wave height ${environment.waveHeightMeters} m.`,
    vesselHazard: `Vessel draft ${vessel.draft} m with cruising speed ${vessel.cruisingSpeed} kn (${vessel.iceCapability}).`
  };

  return {
    overallRiskScore,
    category,
    components: {
      icebergRisk: Math.round(icebergRisk * 100),
      seaIceRisk: Math.round(seaIceRisk * 100),
      weatherRisk: Math.round(weatherRisk * 100),
      oceanRisk: Math.round(oceanRisk * 100),
      vesselHazard: Math.round(vesselHazard * 100)
    },
    reasons,
    clearanceKm,
    distanceToRouteKm: closestIcebergDistKm
  };
}
