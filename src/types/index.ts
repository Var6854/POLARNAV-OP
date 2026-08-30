export type StepState =
  | 'VESSEL_SELECTION'
  | 'DESTINATION_SELECTION'
  | 'ENVIRONMENTAL_ANALYSIS'
  | 'ROUTE_GENERATION'
  | 'ROUTE_CONFIRMATION'
  | 'VOYAGE_ACTIVE';

export type PageId =
  | 'dashboard'
  | 'sea_ice'
  | 'icebergs'
  | 'routes'
  | 'alerts';

export interface Vessel {
  id: string;
  name: string;
  type: string;
  draft: number;
  cruisingSpeed: number;
  maneuverability: 'High' | 'Medium' | 'Medium-Low' | 'Low';
  iceCapability: string;
  maxSpeed: number;
  fuelConsumptionRate: number;
  description: string;
  icon: string;
}

export interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
  description?: string;
  isCustom?: boolean;
}

export interface Iceberg {
  id: string;
  name: string;
  status: 'MONITORED' | 'WATCH' | 'CRITICAL' | 'NORMAL';
  lat: number;
  lng: number;
  estimatedSize: number;
  driftSpeed: number;
  driftHeading: number;
  headingLabel: string;
  source: string;
  confidence: number;
  keelDepth: number;
  lastObserved: string;
  historicalTrack: [number, number][];
  predictedTrajectory: [number, number][];
  uncertaintyCorridor: [number, number][][];
  hazardRadius: number;
}

export interface CandidateRoute {
  id: 'a' | 'b' | 'c';
  name: string;
  tag: string;
  distanceKm: number;
  etaHours: number;
  fuelLiters: number;
  riskCategory: 'LOW' | 'MODERATE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  waypoints: [number, number][];
  seaIceExposure: 'Low' | 'Moderate' | 'High';
  icebergExposure: 'Minimal' | 'Moderate' | 'High' | 'Severe';
  status: 'RECOMMENDED' | 'ACCEPTABLE' | 'AVOID' | 'ACTIVE' | 'SECONDARY';
  description: string;
  costBreakdown: {
    distance: number;
    seaIce: number;
    iceberg: number;
    weather: number;
    vesselDraft: number;
  };
}

export interface EnvironmentalState {
  seaIceConcentrationAvg: number;
  windSpeedKnots: number;
  windDirection: string;
  waveHeightMeters: number;
  oceanCurrentSpeed: number;
  oceanCurrentDirection: string;
  visibilityKm: number;
  temperatureC: number;
  dataFreshnessMin: number;
  modelConfidencePercent: number;
  forecast: {
    time: string;
    concentration: number;
    driftKm: number;
  }[];
}

export interface RiskAssessmentDetails {
  overallRiskScore: number;
  category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  components: {
    icebergRisk: number;
    seaIceRisk: number;
    weatherRisk: number;
    oceanRisk: number;
    vesselHazard: number;
  };
  reasons: {
    icebergRisk: string;
    seaIceRisk: string;
    weatherRisk: string;
    oceanRisk: string;
    vesselHazard: string;
  };
  clearanceKm: number;
  distanceToRouteKm: number;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'alert' | 'success';
}

export interface AppState {
  currentStep: StepState;
  activePage: PageId;
  selectedVessel: Vessel | null;
  origin: LocationPoint;
  destination: LocationPoint | null;
  environment: EnvironmentalState;
  icebergs: Iceberg[];
  candidateRoutes: CandidateRoute[];
  activeRouteId: 'a' | 'b' | 'c';
  vesselProgressPercent: number;
  icebergEventTriggered: boolean;
  alertActive: boolean;
  rerouteCalculated: boolean;
  rerouteAccepted: boolean;
  timeline: TimelineEvent[];
  simulationTimeMinutes: number;
  demoModeActive: boolean;
}
