const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = 'C:\\Users\\Admin1\\Documents\\hackathon\\POLARNAV_Architecture_and_Algorithms_Guide.pdf';

const doc = new PDFDocument({
  size: 'A4',
  margin: 40,
  bufferPages: true
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Colors
const PRIMARY = '#0f172a'; // Deep Navy
const ACCENT = '#0284c7';  // Sky Blue
const SUCCESS = '#059669'; // Emerald
const ALERT = '#e11d48';   // Rose
const TEXT = '#334155';    // Slate Text
const LIGHT_BG = '#f8fafc';// Light Background
const BORDER = '#cbd5e1';  // Border Slate

function drawHeader() {
  doc.rect(40, 40, 515, 60).fill('#0f172a');
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('POLARNAV', 55, 52);
  doc.fillColor('#0284c7').fontSize(9).font('Helvetica-Bold').text('ANTARCTIC MARITIME INTELLIGENCE & DECISION SUPPORT', 55, 76);
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('TECHNICAL ARCHITECTURE & ALGORITHM DEFENSE GUIDE', 280, 76);
  doc.y = 115;
}

drawHeader();

// Section 1: Tech Stack
doc.fillColor(PRIMARY).fontSize(14).font('Helvetica-Bold').text('1. Complete Tech Stack Architecture', 40, 115);
doc.moveDown(0.3);

const stackItems = [
  { category: 'Frontend Framework & Runtime', tech: 'React 19 + TypeScript + Vite 8', desc: 'Type-safe state management across complex voyage workflows with sub-second HMR.' },
  { category: 'Theme Engine', tech: 'CSS Variables + Data-Theme', desc: 'Dynamic toggling between Clean Light UI (#f8fafc) and Dark Tactical Mode (#060911).' },
  { category: 'Geospatial Renderer', tech: 'Leaflet 1.9 + Esri GIS Canvas Tiles', desc: 'Keyless vector-like tile renderer (World_Light_Gray_Base & World_Dark_Gray_Base).' },
  { category: 'Analytics & Visualization', tech: 'Recharts SVG + Lucide Icons', desc: 'Responsive SVG charting for sea ice concentration trends, depth profiles, & risk graphs.' },
  { category: 'Pathfinding & Risk Engines', tech: 'routingEngine.ts & riskEngine.ts', desc: 'Pure TypeScript functional modules executing A* pathfinding and MCDA risk indexing.' },
  { category: 'Deployment & CI/CD', tech: 'Vercel SPA Pipeline + GitHub', desc: 'Automated CI/CD linked to GitHub repository (Var6854/POLARNAV-OP).' }
];

stackItems.forEach((item) => {
  doc.rect(40, doc.y, 515, 34).fillAndStroke(LIGHT_BG, BORDER);
  const startY = doc.y - 30;
  doc.fillColor(ACCENT).fontSize(9).font('Helvetica-Bold').text(item.category, 48, startY);
  doc.fillColor(PRIMARY).fontSize(9).font('Helvetica-Bold').text(item.tech, 220, startY);
  doc.fillColor(TEXT).fontSize(8).font('Helvetica').text(item.desc, 48, startY + 12);
  doc.y = startY + 24;
});

doc.moveDown(1.5);

// Section 2: Demo Scenario Walkthrough
doc.fillColor(PRIMARY).fontSize(14).font('Helvetica-Bold').text('2. Continuous Demo Scenario Walkthrough (Step-by-Step)', 40, doc.y);
doc.moveDown(0.3);

const steps = [
  { step: 'STEP 1', title: 'Vessel Selection', desc: 'Operator selects INSV POLARIS (Class 1 A1 Icebreaker). Vessel draft (8.2m) and ice rating determine physical clearance required around icebergs & bathymetry.' },
  { step: 'STEP 2', title: 'Destination & Passage Selection', desc: 'Operator selects Bharati Station / Weddell Sea Base on interactive Antarctic map. Defines origin-destination bounds and initializes scanning.' },
  { step: 'STEP 3', title: 'Multi-Sensor Environmental Scan', desc: 'Runs multi-sensor scanning (Satellite SAR, Sentinel-1B, MODIS sea ice). Establishes baseline risk weights (Ice: 45%, Wind: SSW 18kn, Temp: -1.8°C).' },
  { step: 'STEP 4', title: 'Candidate Route Generation', desc: 'System generates 3 candidate routes (Route A: Shortest, Route B: Deep Ocean Bypass, Route C: Western Outer Shelf) using A* pathfinding & MCDA matrix.' },
  { step: 'STEP 5', title: 'Route Confirmation & Launch', desc: 'Operator selects Route A, reviews risk score (22/100 LOW), and launches voyage. Real-time ticker advances vessel along Route A.' },
  { step: 'STEP 6', title: 'Iceberg Trajectory Alert & Reroute', desc: 'Tracked iceberg IB-042 shifts trajectory toward Route A, raising risk to 84/100 (CRITICAL). POLARNAV triggers alert, recommends Route B, and executes 1-click reroute.' }
];

steps.forEach((s) => {
  doc.rect(40, doc.y, 515, 32).fillAndStroke('#ffffff', BORDER);
  const startY = doc.y - 28;
  doc.rect(46, startY + 2, 45, 14).fill(ACCENT);
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text(s.step, 53, startY + 5);
  doc.fillColor(PRIMARY).fontSize(9).font('Helvetica-Bold').text(s.title, 100, startY + 3);
  doc.fillColor(TEXT).fontSize(8).font('Helvetica').text(s.desc, 100, startY + 15, { width: 440 });
  doc.y = startY + 26;
});

doc.addPage();
drawHeader();

// Section 3: Algorithms Used & Technical Justifications
doc.fillColor(PRIMARY).fontSize(14).font('Helvetica-Bold').text('3. Algorithms Used & Technical Justifications', 40, 115);
doc.moveDown(0.5);

// Algorithm 1: A* Pathfinding
doc.fillColor(ACCENT).fontSize(11).font('Helvetica-Bold').text('Algorithm 1: A* Search with Polygon Obstacle Masking (Pathfinding)', 40, doc.y);
doc.moveDown(0.2);
doc.fillColor(TEXT).fontSize(9).font('Helvetica').text(
  'Formula: F(n) = G(n) + H(n) + W_ice * C_ice + W_berg * C_berg + W_land * C_land\n' +
  '• G(n): Actual distance traveled from origin to current point.\n' +
  '• H(n): Estimated Haversine distance from current point to destination.\n' +
  '• C_land = Infinity if segment intersects Antarctic Peninsula land polygon mask.',
  40, doc.y, { width: 515 }
);
doc.moveDown(0.4);

doc.fillColor(PRIMARY).fontSize(9).font('Helvetica-Bold').text('Why A* Was Chosen Over Alternatives:', 40, doc.y);
doc.moveDown(0.2);
doc.fillColor(TEXT).fontSize(8.5).font('Helvetica').text(
  '• vs. Great Circle / Rhumb Line: Great Circle ignores physical land barriers, drawing lines through Trinity Peninsula continent. A* guarantees 100% ocean-only corridor routing.\n' +
  '• vs. Dijkstra Algorithm: Dijkstra explores nodes uniformly in all 360° directions, making it computationally slow on spatial grids. A* uses spatial heuristic H(n) to direct search toward destination, reducing computation by >80%.\n' +
  '• vs. Genetic Algorithms / RRT: GA and RRT are non-deterministic and produce random, jagged maritime waypoints. A* produces deterministic, smooth maritime corridors suitable for ship navigation.',
  40, doc.y, { width: 515 }
);

doc.moveDown(1);

// Algorithm 2: Haversine
doc.fillColor(ACCENT).fontSize(11).font('Helvetica-Bold').text('Algorithm 2: Haversine Spherical Distance Formula (Geospatial Metric)', 40, doc.y);
doc.moveDown(0.2);
doc.fillColor(TEXT).fontSize(9).font('Helvetica').text(
  'Formula: a = sin^2(dLat/2) + cos(lat1)*cos(lat2)*sin^2(dLng/2)\n' +
  '         c = 2 * atan2(sqrt(a), sqrt(1-a)),  Distance d = R * c  (R = 6,371 km)',
  40, doc.y, { width: 515 }
);
doc.moveDown(0.4);

doc.fillColor(PRIMARY).fontSize(9).font('Helvetica-Bold').text('Why Haversine Was Chosen Over Alternatives:', 40, doc.y);
doc.moveDown(0.2);
doc.fillColor(TEXT).fontSize(8.5).font('Helvetica').text(
  '• vs. 2D Euclidean Distance: Euclidean distance assumes a flat 2D plane. Near Antarctica (62°S - 68°S), longitude lines converge rapidly toward the South Pole, causing massive distance distortion. Haversine accurately accounts for Earth spherical curvature.\n' +
  '• vs. Vincenty Ellipsoidal Formula: Vincenty is slightly more precise but requires complex iterative equations that can fail to converge near polar extremes. Haversine is fast, accurate within 0.3%, and never deadlocks.',
  40, doc.y, { width: 515 }
);

doc.moveDown(1);

// Algorithm 3: MCDA
doc.fillColor(ACCENT).fontSize(11).font('Helvetica-Bold').text('Algorithm 3: Multi-Criteria Decision Analysis (MCDA) Risk Score Index', 40, doc.y);
doc.moveDown(0.2);
doc.fillColor(TEXT).fontSize(9).font('Helvetica').text(
  'Formula: Risk Score = w1*IcebergProximity + w2*IcePackDensity + w3*WindState + w4*(Draft/Depth)\n' +
  'Normalized to an intuitive 0-100 risk scale (0-39: LOW, 40-59: MODERATE, 60-74: HIGH, 75-100: CRITICAL).',
  40, doc.y, { width: 515 }
);
doc.moveDown(0.4);

doc.fillColor(PRIMARY).fontSize(9).font('Helvetica-Bold').text('Why MCDA Was Chosen Over Alternatives:', 40, doc.y);
doc.moveDown(0.2);
doc.fillColor(TEXT).fontSize(8.5).font('Helvetica').text(
  '• vs. Single-Factor Thresholding: Single-factor rules fail to evaluate compounding hazards (e.g., moderate sea ice combined with a deep tabular iceberg draft). MCDA evaluates all multi-sensory environmental variables simultaneously to provide a unified risk score.',
  40, doc.y, { width: 515 }
);

// Footer & Page Numbers
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text(
    `POLARNAV Technical Guide — Page ${i + 1} of ${range.count}`,
    40, 810, { align: 'center', width: 515 }
  );
}

doc.end();

stream.on('finish', () => {
  console.log('PDF created successfully at: ' + outputPath);
});
