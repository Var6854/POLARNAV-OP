const fs = require('fs');
const PDFDocument = require('pdfkit');

const outputPath = 'C:\\Users\\Admin1\\Documents\\hackathon\\POLARNAV_Step_By_Step_Simulation_Algorithms.pdf';

const doc = new PDFDocument({
  size: 'A4',
  margin: 36,
  bufferPages: true
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Colors
const PRIMARY = '#0f172a'; // Deep Navy
const ACCENT = '#0284c7';  // Sky Blue
const SUCCESS = '#059669'; // Emerald
const ALERT = '#e11d48';   // Rose
const WARN = '#d97706';    // Amber
const TEXT = '#334155';    // Slate Text
const LIGHT_BG = '#f8fafc';// Light Slate
const BORDER = '#cbd5e1';  // Border Slate

function drawHeader() {
  doc.rect(36, 36, 523, 55).fill(PRIMARY);
  doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('POLARNAV', 48, 46);
  doc.fillColor(ACCENT).fontSize(9).font('Helvetica-Bold').text('ANTARCTIC MARITIME INTELLIGENCE SIMULATION', 48, 68);
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('STEP-BY-STEP SIMULATION & ALGORITHM EXECUTION', 260, 68);
  doc.y = 105;
}

drawHeader();

doc.fillColor(PRIMARY).fontSize(13).font('Helvetica-Bold').text('POLARNAV Simulation Walkthrough & Algorithm Mechanics', 36, 100);
doc.fillColor(TEXT).fontSize(8.5).font('Helvetica').text(
  'This guide explains the exact algorithm, mathematical formula, and decision rule executed at every stage of the POLARNAV voyage simulation.',
  36, 116, { width: 523 }
);

doc.y = 135;

const phases = [
  {
    num: 'PHASE 1',
    event: 'Vessel Selection & Spatial Target Resolution',
    appAction: 'Operator selects vessel (e.g. INSV POLARIS) and clicks destination point on Antarctic map.',
    algo: 'Haversine Spherical Metric & Draft Constraint Validation',
    formula: 'a = sin^2(dLat/2) + cos(lat1)*cos(lat2)*sin^2(dLng/2) | d = R * 2 * atan2(sqrt(a), sqrt(1-a))',
    why: 'Euclidean 2D flat distance fails at polar latitudes (62°S-68°S) due to rapid longitude convergence. Haversine measures true spherical distance without polar distortion. Vessel draft (8.2m) sets minimum bathymetric depth boundaries.'
  },
  {
    num: 'PHASE 2',
    event: 'Environmental Analysis & Sea Ice Processing',
    appAction: 'System scans sea-ice concentration zones, wind vectors, and surface temperature isotherms.',
    algo: 'Multi-Sensor Data Fusion & Spatial Polygonal Interpolation',
    formula: 'Ice Density Weight = Sum(Polygon_Area_i * Concentration_i) / Total_Corridor_Area',
    why: 'Fuses MODIS optical sea ice images, Sentinel-1B Synthetic Aperture Radar (SAR), and ECMWF wind data into 3 distinct density zones (Heavy 82%, Moderate 45%, Light 18%). Avoids treating whole polar areas as uniform ice.'
  },
  {
    num: 'PHASE 3',
    event: 'Candidate Route Generation & Passage Analysis',
    appAction: 'System calculates Route A (Shortest Corridor), Route B (Outer Deep Ocean Bypass), & Route C (Western Shelf).',
    algo: 'A* Multi-Criteria Grid Search with Land Polygon Masking',
    formula: 'F(n) = G(n) + H(n) + W_ice*C_ice + W_berg*C_berg + W_land*C_land (C_land = Infinity on Land)',
    why: 'Standard Great Circle routes draw straight lines through land masses. A* uses a land polygon boundary mask to penalize land crossing with infinite cost, steering waypoints into open sea channels (Antarctic Sound).'
  },
  {
    num: 'PHASE 4',
    event: 'Iceberg Trajectory Tracking & Hazard Clearance',
    appAction: 'SAR radar tracks tabular icebergs (IB-042) and projects drift vector paths.',
    algo: 'Kinetic Drift Trajectory Model & Gaussian Clearance Radii',
    formula: 'Pos(t+dt) = Pos(t) + (V_current * 0.8 + V_wind * 0.2) * dt | Hazard_Radius = Size + Keel_Buffer',
    why: 'Icebergs move due to deep ocean currents (80%) and surface wind (20%). Predicting 6-hour drift vectors allows POLARNAV to calculate submerged keel collision risk long before visual contact.'
  }
];

phases.forEach((p) => {
  const boxHeight = 72;
  doc.rect(36, doc.y, 523, boxHeight).fillAndStroke(LIGHT_BG, BORDER);
  const startY = doc.y - (boxHeight - 6);
  
  doc.rect(42, startY + 2, 48, 14).fill(ACCENT);
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold').text(p.num, 47, startY + 5);
  doc.fillColor(PRIMARY).fontSize(9.5).font('Helvetica-Bold').text(p.event, 96, startY + 3);
  
  doc.fillColor(TEXT).fontSize(7.5).font('Helvetica-Bold').text('App Action: ', 42, startY + 18);
  doc.fillColor(TEXT).fontSize(7.5).font('Helvetica').text(p.appAction, 92, startY + 18, { width: 450 });

  doc.fillColor(ACCENT).fontSize(7.5).font('Helvetica-Bold').text('Algorithm: ', 42, startY + 29);
  doc.fillColor(PRIMARY).fontSize(7.5).font('Helvetica-Bold').text(p.algo, 92, startY + 29);

  doc.fillColor(WARN).fontSize(7).font('Helvetica-Bold').text('Formula: ', 42, startY + 40);
  doc.fillColor(TEXT).fontSize(7).font('Helvetica').text(p.formula, 92, startY + 40, { width: 450 });

  doc.fillColor(SUCCESS).fontSize(7).font('Helvetica-Bold').text('Why Used: ', 42, startY + 51);
  doc.fillColor(TEXT).fontSize(7).font('Helvetica').text(p.why, 92, startY + 51, { width: 450 });

  doc.y = startY + boxHeight + 6;
});

doc.addPage();
drawHeader();

doc.fillColor(PRIMARY).fontSize(13).font('Helvetica-Bold').text('POLARNAV Simulation Walkthrough & Algorithm Mechanics (Cont.)', 36, 100);
doc.y = 125;

const phasesPage2 = [
  {
    num: 'PHASE 5',
    event: 'Iceberg Trajectory Shift & Real-Time Alert Triggering',
    appAction: 'Sentinel-1B detects IB-042 trajectory shift toward NW corridor. Risk score jumps from 22 (LOW) to 84 (CRITICAL). POLARNAV triggers RED ALERT.',
    algo: 'Threshold-Based Multi-Criteria Risk Indexing (MCDA)',
    formula: 'Risk = w1*(1/Clearance_Distance) + w2*IceDensity + w3*WindState | Alert IF Risk >= 75',
    why: 'Instead of waiting for ship radar to detect the iceberg visually (<5 km), MCDA continuously computes clearance distance against projected SAR drift vectors. Crossing the 1.5 km clearance threshold instantly triggers an alert.'
  },
  {
    num: 'PHASE 6',
    event: 'Dynamic Re-Routing & Course Alteration',
    appAction: 'POLARNAV recalculates risk, marks Route A as AVOID, identifies Route B (Deep Outer Bypass) as OPTIMAL, and executes 1-click course alteration.',
    algo: 'Real-Time Dynamic A* Re-pathfinding with Hazard Cost Penalty',
    formula: 'Cost(Route A) -> Infinity (Due to IB-042 Clearance Deficit) | Select Min(Cost(Route B), Cost(Route C))',
    why: 'Dynamic A* does not recalculate the entire path from scratch. It injects a high hazard cost penalty on the compromised Route A corridor and evaluates pre-computed candidate branch nodes to switch to Route B in under 50ms.'
  }
];

phasesPage2.forEach((p) => {
  const boxHeight = 78;
  doc.rect(36, doc.y, 523, boxHeight).fillAndStroke(LIGHT_BG, BORDER);
  const startY = doc.y - (boxHeight - 6);
  
  doc.rect(42, startY + 2, 48, 14).fill(ALERT);
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold').text(p.num, 47, startY + 5);
  doc.fillColor(PRIMARY).fontSize(9.5).font('Helvetica-Bold').text(p.event, 96, startY + 3);
  
  doc.fillColor(TEXT).fontSize(7.5).font('Helvetica-Bold').text('App Action: ', 42, startY + 18);
  doc.fillColor(TEXT).fontSize(7.5).font('Helvetica').text(p.appAction, 92, startY + 18, { width: 450 });

  doc.fillColor(ACCENT).fontSize(7.5).font('Helvetica-Bold').text('Algorithm: ', 42, startY + 29);
  doc.fillColor(PRIMARY).fontSize(7.5).font('Helvetica-Bold').text(p.algo, 92, startY + 29);

  doc.fillColor(WARN).fontSize(7).font('Helvetica-Bold').text('Formula: ', 42, startY + 40);
  doc.fillColor(TEXT).fontSize(7).font('Helvetica').text(p.formula, 92, startY + 40, { width: 450 });

  doc.fillColor(SUCCESS).fontSize(7).font('Helvetica-Bold').text('Why Used: ', 42, startY + 51);
  doc.fillColor(TEXT).fontSize(7).font('Helvetica').text(p.why, 92, startY + 51, { width: 450 });

  doc.y = startY + boxHeight + 8;
});

doc.moveDown(1);

// Executive Summary Table
doc.fillColor(PRIMARY).fontSize(12).font('Helvetica-Bold').text('Summary: Algorithm Execution Matrix across Voyage Lifecycle', 36, doc.y);
doc.moveDown(0.4);

const summaryRows = [
  ['Simulation Phase', 'Trigger / Input', 'Algorithm / Technique', 'Output / System State'],
  ['Phase 1: Setup', 'Vessel & Destination Click', 'Haversine & Bathymetric Draft Filter', 'Origin-Destination Ocean Channel Bounds'],
  ['Phase 2: Environment', 'SAR & MODIS Satellite Feed', 'Multi-Sensor Data Fusion & Spatial Polygons', '3 Sea-Ice Density Zones (82%, 45%, 18%)'],
  ['Phase 3: Routing', 'A* Pathfinder Trigger', 'A* Multi-Criteria Grid + Land Masking', '3 Ocean-Only Routes (A, B, C)'],
  ['Phase 4: Tracking', 'Sentinel-1B Radar Pass', 'Kinetic Drift Vector & Gaussian Radius', 'Iceberg Trajectory & Submerged Clearance'],
  ['Phase 5: Alert', 'IB-042 Trajectory Shift', 'MCDA Threshold Breach (Score 84)', 'RED ALERT: Route A Flagged AVOID'],
  ['Phase 6: Reroute', 'Operator Accepts Reroute', 'Dynamic A* Hazard Re-pathfinding', 'Route B Active (80+ km Clearance)']
];

let tableTop = doc.y;
summaryRows.forEach((row, i) => {
  const y = tableTop + (i * 20);
  if (i === 0) {
    doc.rect(36, y, 523, 18).fill(PRIMARY);
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
  } else {
    doc.rect(36, y, 523, 18).fillAndStroke(i % 2 === 0 ? LIGHT_BG : '#ffffff', BORDER);
    doc.fillColor(TEXT).fontSize(7).font('Helvetica');
  }
  doc.text(row[0], 42, y + 4, { width: 100 });
  doc.text(row[1], 145, y + 4, { width: 110 });
  doc.text(row[2], 260, y + 4, { width: 150 });
  doc.text(row[3], 415, y + 4, { width: 140 });
});

// Footer
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text(
    `POLARNAV Simulation Walkthrough & Algorithm Guide — Page ${i + 1} of ${range.count}`,
    36, 815, { align: 'center', width: 523 }
  );
}

doc.end();

stream.on('finish', () => {
  console.log('Simulation PDF created successfully at: ' + outputPath);
});
