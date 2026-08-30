import type { Vessel, LocationPoint, Iceberg, EnvironmentalState, TimelineEvent } from '../types';

export const VESSELS: Vessel[] = [
  {
    id: 'insv-polaris',
    name: 'INSV POLARIS',
    type: 'Research Vessel',
    draft: 8.2,
    cruisingSpeed: 12,
    maneuverability: 'Medium',
    iceCapability: 'Ice-capable (PC6 Class)',
    maxSpeed: 15,
    fuelConsumptionRate: 21.2,
    description: 'NCPOR flagship polar research vessel engineered for deep multi-disciplinary oceanographic & geophysical surveys.',
    icon: 'ship-polar'
  },
  {
    id: 'insv-arctic-star',
    name: 'INSV ARCTIC STAR',
    type: 'Research Vessel',
    draft: 7.4,
    cruisingSpeed: 14,
    maneuverability: 'High',
    iceCapability: 'Ice-capable (PC5 Class)',
    maxSpeed: 17,
    fuelConsumptionRate: 19.8,
    description: 'High-agility polar expedition vessel with enhanced thrusters and shallow draft for coastal bathymetric exploration.',
    icon: 'ship-star'
  },
  {
    id: 'insv-ocean-explorer',
    name: 'INSV OCEAN EXPLORER',
    type: 'Research Vessel',
    draft: 9.0,
    cruisingSpeed: 11,
    maneuverability: 'Medium-Low',
    iceCapability: 'Heavy Icebreaker / Research',
    maxSpeed: 14,
    fuelConsumptionRate: 24.5,
    description: 'Heavy polar research platform with deep draft, high endurance, and ice-strengthened hull for core sampling.',
    icon: 'ship-heavy'
  }
];

export const ORIGIN_LOCATION: LocationPoint = {
  name: 'King George Island Staging Base',
  lat: -62.20,
  lng: -58.96,
  description: 'Antarctic Peninsula Maritime Hub (Bransfield Strait Open Water Entrance)'
};

export const SUGGESTED_DESTINATIONS: LocationPoint[] = [
  {
    name: 'Polar Research Station Alpha',
    lat: -63.85,
    lng: -57.45,
    description: 'NCPOR Atmospheric & Glaciological Science Hub (Weddell Coast)'
  },
  {
    name: 'Coastal Research Point',
    lat: -64.25,
    lng: -56.80,
    description: 'Marine Biology & Benthic Ecosystem Monitoring Bay'
  },
  {
    name: 'Polar Science Station',
    lat: -64.80,
    lng: -63.50,
    description: 'Deep Ice Core Drilling & Sub-glacial Research Station'
  },
  {
    name: 'Ice Observation Station',
    lat: -65.10,
    lng: -60.20,
    description: 'Satellite Ground Truth & Ice Shelf Stability Observatory'
  }
];

export const INITIAL_ICEBERGS: Iceberg[] = [
  {
    id: 'IB-042',
    name: 'IB-042 (Tabular)',
    status: 'WATCH',
    lat: -63.50,
    lng: -59.60,
    estimatedSize: 1.8,
    driftSpeed: 0.38,
    driftHeading: 220,
    headingLabel: 'SW (Clearing Corridor)',
    source: 'Sentinel-1 SAR Satellite',
    confidence: 78,
    keelDepth: 142,
    lastObserved: '12 min ago',
    historicalTrack: [
      [-63.30, -59.30],
      [-63.40, -59.45],
      [-63.50, -59.60]
    ],
    predictedTrajectory: [
      [-63.50, -59.60],
      [-63.65, -59.85],
      [-63.80, -60.10]
    ],
    uncertaintyCorridor: [
      [
        [-63.50, -59.60],
        [-63.60, -59.70],
        [-63.85, -59.95],
        [-63.75, -60.20],
        [-63.45, -59.75]
      ]
    ],
    hazardRadius: 3.8
  },
  {
    id: 'IB-019',
    name: 'IB-019 (Pinnacle)',
    status: 'MONITORED',
    lat: -64.20,
    lng: -60.10,
    estimatedSize: 0.9,
    driftSpeed: 0.28,
    driftHeading: 180,
    headingLabel: 'S',
    source: 'SAR + Ship Radar',
    confidence: 85,
    keelDepth: 88,
    lastObserved: '24 min ago',
    historicalTrack: [
      [-64.05, -60.10],
      [-64.20, -60.10]
    ],
    predictedTrajectory: [
      [-64.20, -60.10],
      [-64.40, -60.10]
    ],
    uncertaintyCorridor: [
      [
        [-64.20, -60.10],
        [-64.45, -59.95],
        [-64.45, -60.25]
      ]
    ],
    hazardRadius: 2.5
  },
  {
    id: 'IB-088',
    name: 'IB-088 (Cluster)',
    status: 'MONITORED',
    lat: -62.30,
    lng: -60.50,
    estimatedSize: 0.5,
    driftSpeed: 0.35,
    driftHeading: 270,
    headingLabel: 'W',
    source: 'MODIS Optical',
    confidence: 72,
    keelDepth: 45,
    lastObserved: '45 min ago',
    historicalTrack: [
      [-62.30, -60.20],
      [-62.30, -60.50]
    ],
    predictedTrajectory: [
      [-62.30, -60.50],
      [-62.30, -60.80]
    ],
    uncertaintyCorridor: [
      [
        [-62.30, -60.50],
        [-62.20, -60.90],
        [-62.40, -60.90]
      ]
    ],
    hazardRadius: 1.8
  },
  {
    id: 'IB-104',
    name: 'IB-104 (Dome)',
    status: 'MONITORED',
    lat: -64.60,
    lng: -55.80,
    estimatedSize: 1.2,
    driftSpeed: 0.22,
    driftHeading: 140,
    headingLabel: 'SE',
    source: 'Sentinel-1 SAR',
    confidence: 91,
    keelDepth: 110,
    lastObserved: '18 min ago',
    historicalTrack: [
      [-64.50, -55.95],
      [-64.60, -55.80]
    ],
    predictedTrajectory: [
      [-64.60, -55.80],
      [-64.75, -55.60]
    ],
    uncertaintyCorridor: [
      [
        [-64.60, -55.80],
        [-64.80, -55.45],
        [-64.70, -55.70]
      ]
    ],
    hazardRadius: 2.8
  },
  {
    id: 'IB-012',
    name: 'IB-012 (Blocky)',
    status: 'NORMAL',
    lat: -61.80,
    lng: -57.50,
    estimatedSize: 0.7,
    driftSpeed: 0.30,
    driftHeading: 45,
    headingLabel: 'NE',
    source: 'AIS + Thermal',
    confidence: 65,
    keelDepth: 62,
    lastObserved: '55 min ago',
    historicalTrack: [
      [-61.90, -57.65],
      [-61.80, -57.50]
    ],
    predictedTrajectory: [
      [-61.80, -57.50],
      [-61.65, -57.30]
    ],
    uncertaintyCorridor: [
      [
        [-61.80, -57.50],
        [-61.60, -57.15],
        [-61.70, -57.40]
      ]
    ],
    hazardRadius: 2.0
  }
];

export const SHIFTED_IB042: Iceberg = {
  id: 'IB-042',
  name: 'IB-042 (Tabular)',
  status: 'CRITICAL',
  lat: -62.90,
  lng: -56.70,
  estimatedSize: 1.8,
  driftSpeed: 0.58,
  driftHeading: 180,
  headingLabel: 'S (DIRECT ROUTE A INTERSECTION)',
  source: 'Sentinel-1 SAR High-Res (Updated)',
  confidence: 89,
  keelDepth: 148,
  lastObserved: 'Just now (New Orbit Pass)',
  historicalTrack: [
    [-62.30, -57.30],
    [-62.50, -57.00],
    [-62.70, -56.85],
    [-62.90, -56.70]
  ],
  predictedTrajectory: [
    [-62.90, -56.70],
    [-63.10, -56.70],
    [-63.30, -56.70],
    [-63.50, -56.90]
  ],
  uncertaintyCorridor: [
    [
      [-62.90, -56.70],
      [-62.80, -56.55],
      [-63.10, -56.45],
      [-63.55, -56.65],
      [-63.35, -56.90]
    ]
  ],
  hazardRadius: 5.5
};

export const INITIAL_ENVIRONMENT: EnvironmentalState = {
  seaIceConcentrationAvg: 32,
  windSpeedKnots: 18,
  windDirection: 'SSW',
  waveHeightMeters: 1.8,
  oceanCurrentSpeed: 0.4,
  oceanCurrentDirection: 'NE',
  visibilityKm: 8.5,
  temperatureC: -4.2,
  dataFreshnessMin: 14,
  modelConfidencePercent: 94,
  forecast: [
    { time: 'Current', concentration: 32, driftKm: 0 },
    { time: '+12h', concentration: 38, driftKm: 3.2 },
    { time: '+24h', concentration: 46, driftKm: 7.1 },
    { time: '+48h', concentration: 51, driftKm: 12.8 }
  ]
};

export const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: 't-1',
    time: '08:00 UTC',
    title: 'Voyage Initialized',
    description: 'NCPOR Operations Center configured INSV POLARIS for Antarctic transit.',
    type: 'info'
  },
  {
    id: 't-2',
    time: '08:15 UTC',
    title: 'Destination Selected',
    description: 'Polar Research Station Alpha (63.85°S, 57.45°W) selected as mission objective.',
    type: 'info'
  },
  {
    id: 't-3',
    time: '08:20 UTC',
    title: 'A* Multi-Criteria Routing Executed',
    description: 'Candidate routes evaluated against Sentinel-1 SAR ice concentration and bathymetry.',
    type: 'info'
  },
  {
    id: 't-4',
    time: '08:30 UTC',
    title: 'Route A Confirmed & Active',
    description: 'Operator selected Route A (420 km, 22h, Low Risk). INSV POLARIS underway.',
    type: 'success'
  }
];
