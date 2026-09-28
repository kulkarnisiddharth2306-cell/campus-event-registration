const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

describe('ANTI-GRAVITY Portal Automated Test Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    // Start an ephemeral test server on an unassigned port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  // Test 1: Health endpoint test (Required)
  it('GET /health returns HTTP 200 and {"status":"ok"}', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.deepStrictEqual(body, { status: 'ok' });
  });

  // Test 2: Valid POST /api/experiments creates experiment (Required)
  it('Valid POST /api/experiments successfully creates an experiment', async () => {
    const payload = {
      name: 'Rover Chassis Alpha',
      mass: 50,
      height: 2.5,
      planet: 'Mars'
    };

    const res = await fetch(`${baseUrl}/api/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();

    assert.ok(data.id, 'Response should contain an auto-generated id');
    assert.strictEqual(data.name, 'Rover Chassis Alpha');
    assert.strictEqual(data.mass, 50);
    assert.strictEqual(data.height, 2.5);
    assert.strictEqual(data.planet, 'Mars');
    assert.strictEqual(data.gravity, 3.71);
    // weight = mass * gravity = 50 * 3.71 = 185.5
    assert.strictEqual(data.weight, 185.5);
    // potential energy = mass * gravity * height = 50 * 3.71 * 2.5 = 463.75
    assert.strictEqual(data.potentialEnergy, 463.75);
    assert.ok(data.createdAt, 'Response should include ISO timestamp');
  });

  // Test 3: Invalid POST /api/experiments returns HTTP 400 (Required)
  it('Invalid POST /api/experiments with missing body returns HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/api/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error, 'Response should include error message');
  });

  it('POST /api/experiments with malformed JSON body returns HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/api/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid-json: none'
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /malformed json/i);
  });

  // Test 4: Invalid mass returns HTTP 400
  it('POST /api/experiments with negative or zero mass returns HTTP 400', async () => {
    const testCases = [-10, 0, 'invalid-mass'];

    for (const invalidMass of testCases) {
      const res = await fetch(`${baseUrl}/api/experiments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Probe',
          mass: invalidMass,
          height: 1.0,
          planet: 'Earth'
        })
      });

      assert.strictEqual(res.status, 400, `Expected 400 for mass: ${invalidMass}`);
      const data = await res.json();
      assert.match(data.error, /mass/i);
    }
  });

  // Test 5: Invalid planet returns HTTP 400
  it('POST /api/experiments with unsupported celestial body returns HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/api/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pluto Lander',
        mass: 25,
        height: 1.0,
        planet: 'Pluto'
      })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /invalid celestial body/i);
  });

  // Test 6: Missing or blank name returns HTTP 400
  it('POST /api/experiments with blank name returns HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/api/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '   ',
        mass: 10,
        height: 1.0,
        planet: 'Earth'
      })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /name/i);
  });

  // Test 7: Negative height returns HTTP 400
  it('POST /api/experiments with negative height returns HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/api/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sub-surface Probe',
        mass: 10,
        height: -5,
        planet: 'Venus'
      })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /height/i);
  });

  // Test 8: GET /api/experiments returns all experiments
  it('GET /api/experiments returns an array containing submitted experiments', async () => {
    const res = await fetch(`${baseUrl}/api/experiments`);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.ok(Array.isArray(data), 'Response should be a JSON array');
    assert.ok(data.length >= 1, 'Array should contain at least one experiment');

    const first = data[0];
    assert.ok(first.id);
    assert.ok(first.name);
    assert.ok(typeof first.mass === 'number');
    assert.ok(typeof first.weight === 'number');
  });

  // Test 9: GET /api/server-info returns server telemetry and Git commit info
  it('GET /api/server-info returns metadata including commit info and planets catalog', async () => {
    const res = await fetch(`${baseUrl}/api/server-info`);
    assert.strictEqual(res.status, 200);

    const info = await res.json();
    assert.strictEqual(info.appName, 'ANTI-GRAVITY — Gravity Simulation & Experiment Portal');
    assert.ok(typeof info.uptimeSeconds === 'number');
    assert.ok(info.serverTime);
    assert.ok(info.gitCommit);
    assert.ok(Array.isArray(info.planets));
    assert.strictEqual(info.planets.length, 5);
  });

  // Test 10: GET / serves the HTML frontend
  it('GET / serves index.html with HTTP 200', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.match(html, /ANTI-GRAVITY/i);
  });
});
