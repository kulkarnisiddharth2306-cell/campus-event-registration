const express = require('express');
const path = require('path');

const app = express();

// Supported planets and their gravitational accelerations (in m/s²)
const CELESTIAL_BODIES = {
  earth: { name: 'Earth', gravity: 9.81, description: 'Dense terrestrial planet with moderate gravity.' },
  moon: { name: 'Moon', gravity: 1.62, description: 'Earth natural satellite with roughly 1/6th Earth gravity.' },
  mars: { name: 'Mars', gravity: 3.71, description: 'The Red Planet with approximately 38% of Earth gravity.' },
  jupiter: { name: 'Jupiter', gravity: 24.79, description: 'Gas giant with the strongest gravitational pull in the solar system.' },
  venus: { name: 'Venus', gravity: 8.87, description: 'Terrestrial planet with gravity close to 90% of Earth.' }
};

// In-memory data store for experiments
let nextExperimentId = 1;
const experiments = [
  {
    id: nextExperimentId++,
    name: 'Apollo Lunar Sample',
    mass: 15.0,
    height: 1.5,
    planet: 'Moon',
    gravity: 1.62,
    weight: 24.3,
    potentialEnergy: 36.45,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: nextExperimentId++,
    name: 'Mars Curiosity Rover Segment',
    mass: 899.0,
    height: 2.0,
    planet: 'Mars',
    gravity: 3.71,
    weight: 3335.29,
    potentialEnergy: 6670.58,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: nextExperimentId++,
    name: 'Galileo Atmospheric Probe',
    mass: 339.0,
    height: 10.0,
    planet: 'Jupiter',
    gravity: 24.79,
    weight: 8403.81,
    potentialEnergy: 84038.1,
    createdAt: new Date(Date.now() - 600000).toISOString()
  }
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint (Strict requirement: returns {"status":"ok"})
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Server telemetry & metadata endpoint
app.get('/api/server-info', (req, res) => {
  res.status(200).json({
    appName: 'ANTI-GRAVITY — Gravity Simulation & Experiment Portal',
    version: '1.0.0',
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    gitCommit: process.env.RENDER_GIT_COMMIT || 'development',
    totalExperiments: experiments.length,
    planets: Object.values(CELESTIAL_BODIES)
  });
});

// GET all experiments
app.get('/api/experiments', (req, res) => {
  res.status(200).json(experiments);
});

// Helper validation function
function validateExperimentInput(body) {
  const { name, mass, height, planet } = body;

  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return 'Name is required and cannot be empty.';
  }

  // Mass validation (must be positive number)
  const numericMass = Number(mass);
  if (mass === undefined || mass === null || mass === '' || Number.isNaN(numericMass) || numericMass <= 0 || !Number.isFinite(numericMass)) {
    return 'Mass must be a positive number greater than 0.';
  }

  // Height validation (must be non-negative number)
  const numericHeight = Number(height);
  if (height === undefined || height === null || height === '' || Number.isNaN(numericHeight) || numericHeight < 0 || !Number.isFinite(numericHeight)) {
    return 'Height must be a non-negative number (0 or greater).';
  }

  // Planet validation
  if (!planet || typeof planet !== 'string') {
    return 'Celestial body/planet is required.';
  }

  const normalizedPlanetKey = planet.trim().toLowerCase();
  const matchedPlanet = CELESTIAL_BODIES[normalizedPlanetKey];
  if (!matchedPlanet) {
    const validPlanets = Object.values(CELESTIAL_BODIES).map(p => p.name).join(', ');
    return `Invalid celestial body "${planet}". Supported options are: ${validPlanets}.`;
  }

  return null;
}

// POST create a new experiment
app.post('/api/experiments', (req, res) => {
  const validationError = validateExperimentInput(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, mass, height, planet } = req.body;
  const normalizedPlanetKey = planet.trim().toLowerCase();
  const celestialBody = CELESTIAL_BODIES[normalizedPlanetKey];

  const parsedMass = Number(Number(mass).toFixed(3));
  const parsedHeight = Number(Number(height).toFixed(3));
  const gravity = celestialBody.gravity;

  // weight = mass * gravitational acceleration
  const calculatedWeight = Number((parsedMass * gravity).toFixed(2));
  // Potential energy PE = m * g * h
  const potentialEnergy = Number((parsedMass * gravity * parsedHeight).toFixed(2));

  const newExperiment = {
    id: nextExperimentId++,
    name: name.trim(),
    mass: parsedMass,
    height: parsedHeight,
    planet: celestialBody.name,
    gravity: gravity,
    weight: calculatedWeight,
    potentialEnergy: potentialEnergy,
    createdAt: new Date().toISOString()
  };

  experiments.push(newExperiment);

  return res.status(201).json(newExperiment);
});

// Central 404 handler for unknown routes
app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  res.status(404).json({ error: 'Endpoint not found' });
});

// Central error handler (does not leak stack traces)
app.use((err, req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload in request.' });
  }
  console.error('Server error encountered:', err.message);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

// Export app for automated testing
module.exports = app;

// Listen only when started directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` ANTI-GRAVITY Portal running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Git Commit: ${process.env.RENDER_GIT_COMMIT || 'development'}`);
    console.log(` Health endpoint: http://localhost:${PORT}/health`);
    console.log(` Portal UI: http://localhost:${PORT}`);
    console.log(`===================================================`);
  });
}
