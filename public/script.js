// ANTI-GRAVITY Frontend Controller
// Pure Vanilla JavaScript (No external frameworks)

(function () {
  'use strict';

  // Celestial gravity lookup table (m/s²)
  const PLANET_GRAVITY = {
    Earth: 9.81,
    Moon: 1.62,
    Mars: 3.71,
    Jupiter: 24.79,
    Venus: 8.87
  };

  // State cache
  let allExperiments = [];

  // DOM Elements
  const healthBadge = document.getElementById('health-indicator');
  const healthText = document.getElementById('health-text');

  const form = document.getElementById('experiment-form');
  const formAlert = document.getElementById('form-alert');
  const nameInput = document.getElementById('name-input');
  const massInput = document.getElementById('mass-input');
  const heightInput = document.getElementById('height-input');
  const planetSelect = document.getElementById('planet-select');
  const submitBtn = document.getElementById('submit-btn');
  const resetBtn = document.getElementById('reset-btn');

  const previewWeight = document.getElementById('preview-weight');
  const previewPe = document.getElementById('preview-pe');

  // Telemetry Card Elements
  const telemetryEmpty = document.getElementById('telemetry-empty');
  const telemetryContent = document.getElementById('telemetry-content');
  const resPlanet = document.getElementById('res-planet');
  const resTime = document.getElementById('res-time');
  const resName = document.getElementById('res-name');
  const resWeight = document.getElementById('res-weight');
  const resMass = document.getElementById('res-mass');
  const resHeight = document.getElementById('res-height');
  const resGravity = document.getElementById('res-gravity');
  const resPe = document.getElementById('res-pe');
  const resEarthRatio = document.getElementById('res-earth-ratio');
  const resProgressFill = document.getElementById('res-progress-fill');

  // Table Elements
  const tableBody = document.getElementById('experiments-table-body');
  const tableSearch = document.getElementById('table-search');
  const refreshBtn = document.getElementById('refresh-experiments-btn');
  const statsTotal = document.getElementById('stats-total');
  const statsAvg = document.getElementById('stats-avg');
  const statsMax = document.getElementById('stats-max');

  // Server Info Elements
  const infoStatus = document.getElementById('info-status');
  const infoNode = document.getElementById('info-node');
  const infoUptime = document.getElementById('info-uptime');
  const infoEnv = document.getElementById('info-env');
  const infoTime = document.getElementById('info-time');
  const infoCommit = document.getElementById('info-commit');
  const footerCommit = document.getElementById('footer-git-commit');

  // Planet quick selector cards
  const planetCards = document.querySelectorAll('.planet-card');

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  function showAlert(message, isError = true) {
    formAlert.textContent = message;
    formAlert.className = isError ? 'alert-box alert-error' : 'alert-box alert-success';
    formAlert.classList.remove('alert-hidden');
  }

  function hideAlert() {
    formAlert.textContent = '';
    formAlert.className = 'alert-box alert-hidden';
  }

  function formatTime(isoString) {
    if (!isoString) return '--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  }

  function formatUptime(seconds) {
    if (typeof seconds !== 'number') return '--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  // -------------------------------------------------------------
  // Live Preview Calculation
  // -------------------------------------------------------------
  function updateLivePreview() {
    const mass = parseFloat(massInput.value);
    const height = parseFloat(heightInput.value) || 0;
    const selectedPlanet = planetSelect.value;
    const gravity = PLANET_GRAVITY[selectedPlanet];

    if (!isNaN(mass) && mass > 0 && gravity) {
      const weight = (mass * gravity).toFixed(2);
      const pe = (mass * gravity * Math.max(0, height)).toFixed(2);
      previewWeight.textContent = `${weight} N`;
      previewPe.textContent = `${pe} J`;
    } else {
      previewWeight.textContent = '-- N';
      previewPe.textContent = '-- J';
    }
  }

  // -------------------------------------------------------------
  // Update Latest Telemetry Panel
  // -------------------------------------------------------------
  function displayTelemetry(exp) {
    if (!exp) {
      telemetryEmpty.style.display = 'block';
      telemetryContent.classList.add('hidden');
      return;
    }

    telemetryEmpty.style.display = 'none';
    telemetryContent.classList.remove('hidden');

    resName.textContent = exp.name;
    resPlanet.textContent = exp.planet;
    resWeight.textContent = Number(exp.weight).toFixed(2);
    resMass.textContent = `${exp.mass} kg`;
    resHeight.textContent = `${exp.height} m`;
    resGravity.textContent = `${exp.gravity} m/s²`;
    resPe.textContent = `${exp.potentialEnergy} J`;
    resTime.textContent = formatTime(exp.createdAt);

    // Earth ratio comparison
    const earthGravity = PLANET_GRAVITY.Earth;
    const ratio = ((exp.gravity / earthGravity) * 100).toFixed(1);
    resEarthRatio.textContent = `${ratio}%`;
    const progressWidth = Math.min(Math.max((exp.gravity / 25) * 100, 5), 100);
    resProgressFill.style.width = `${progressWidth}%`;
  }

  // -------------------------------------------------------------
  // Render Experiments Table & Summary Stats
  // -------------------------------------------------------------
  function renderTable(experiments) {
    if (!experiments || experiments.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="9" class="table-loading-cell">No experiments recorded yet. Submit the form above to record one!</td></tr>';
      statsTotal.textContent = '0';
      statsAvg.textContent = '0 N';
      statsMax.textContent = '0 N';
      return;
    }

    // Calculate Summary Stats
    const total = experiments.length;
    const totalWeight = experiments.reduce((sum, e) => sum + (Number(e.weight) || 0), 0);
    const avgWeight = (totalWeight / total).toFixed(2);
    const maxWeight = Math.max(...experiments.map(e => Number(e.weight) || 0)).toFixed(2);

    statsTotal.textContent = total;
    statsAvg.textContent = `${avgWeight} N`;
    statsMax.textContent = `${maxWeight} N`;

    // Render Table Rows
    const rowsHtml = experiments.slice().reverse().map(exp => {
      return `
        <tr>
          <td>#${exp.id}</td>
          <td><strong>${escapeHtml(exp.name)}</strong></td>
          <td>${escapeHtml(exp.planet)}</td>
          <td>${exp.gravity} m/s&sup2;</td>
          <td>${exp.mass} kg</td>
          <td>${exp.height} m</td>
          <td class="cell-weight">${Number(exp.weight).toFixed(2)} N</td>
          <td class="cell-pe">${Number(exp.potentialEnergy).toFixed(2)} J</td>
          <td>${formatTime(exp.createdAt)}</td>
        </tr>
      `;
    }).join('');

    tableBody.innerHTML = rowsHtml;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------
  // Data Fetching: Health, Experiments, Server Info
  // -------------------------------------------------------------
  async function fetchHealth() {
    try {
      const res = await fetch('/health');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          healthBadge.className = 'status-badge status-healthy';
          healthText.textContent = 'System Healthy (200 OK)';
          infoStatus.textContent = 'Operational (200 OK)';
          infoStatus.className = 'info-value text-accent';
          return;
        }
      }
      throw new Error('Unexpected health response');
    } catch {
      healthBadge.className = 'status-badge status-error';
      healthText.textContent = 'Healthcheck Offline';
      infoStatus.textContent = 'Degraded / Error';
      infoStatus.className = 'info-value text-highlight';
    }
  }

  async function fetchServerInfo() {
    try {
      const res = await fetch('/api/server-info');
      if (!res.ok) throw new Error('Failed to load server info');
      const info = await res.json();

      infoNode.textContent = info.nodeVersion || 'Unknown';
      infoUptime.textContent = formatUptime(info.uptimeSeconds);
      infoEnv.textContent = info.environment || 'development';
      infoTime.textContent = info.serverTime ? new Date(info.serverTime).toUTCString() : '--';

      const commit = info.gitCommit || 'development';
      infoCommit.textContent = commit;
      footerCommit.textContent = commit.length > 7 ? commit.substring(0, 7) : commit;
      footerCommit.title = `Full Commit: ${commit}`;
    } catch (err) {
      console.warn('Error fetching server diagnostics:', err);
    }
  }

  async function fetchExperiments() {
    try {
      const res = await fetch('/api/experiments');
      if (!res.ok) throw new Error('Failed to fetch experiments');
      const data = await res.json();
      allExperiments = data;
      renderTable(allExperiments);

      if (allExperiments.length > 0) {
        displayTelemetry(allExperiments[allExperiments.length - 1]);
      }
    } catch (err) {
      console.error('Error loading experiments:', err);
      tableBody.innerHTML = '<tr><td colspan="9" class="table-loading-cell">Failed to load experiments from server.</td></tr>';
    }
  }

  // -------------------------------------------------------------
  // Event Listeners
  // -------------------------------------------------------------

  // Input changes for live calculation
  massInput.addEventListener('input', updateLivePreview);
  heightInput.addEventListener('input', updateLivePreview);
  planetSelect.addEventListener('change', updateLivePreview);

  // Quick planet select from reference grid cards
  planetCards.forEach(card => {
    card.addEventListener('click', () => {
      const planet = card.getAttribute('data-planet');
      if (planet) {
        planetSelect.value = planet;
        updateLivePreview();
        planetSelect.focus();
      }
    });
  });

  // Table Search Filter
  tableSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      renderTable(allExperiments);
      return;
    }
    const filtered = allExperiments.filter(exp => 
      exp.name.toLowerCase().includes(query) || 
      exp.planet.toLowerCase().includes(query)
    );
    renderTable(filtered);
  });

  // Refresh Button
  refreshBtn.addEventListener('click', () => {
    fetchExperiments();
    fetchServerInfo();
    fetchHealth();
  });

  // Reset Button
  resetBtn.addEventListener('click', () => {
    form.reset();
    hideAlert();
    updateLivePreview();
    nameInput.focus();
  });

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const name = nameInput.value.trim();
    const mass = parseFloat(massInput.value);
    const height = parseFloat(heightInput.value);
    const planet = planetSelect.value;

    // Client-side quick check
    if (!name) {
      showAlert('Please enter an object or person name.');
      nameInput.focus();
      return;
    }
    if (isNaN(mass) || mass <= 0) {
      showAlert('Mass must be a positive number greater than 0.');
      massInput.focus();
      return;
    }
    if (isNaN(height) || height < 0) {
      showAlert('Height must be zero or a positive number.');
      heightInput.focus();
      return;
    }
    if (!planet) {
      showAlert('Please select a celestial body.');
      planetSelect.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span> Calculating...';

    try {
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, mass, height, planet })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server rejected experiment data.');
      }

      // Success
      showAlert(`Experiment recorded successfully! Weight on ${data.planet}: ${data.weight} N.`, false);
      displayTelemetry(data);

      // Add to local state and update table
      allExperiments.push(data);
      renderTable(allExperiments);

      // Reset fields
      form.reset();
      updateLivePreview();
      nameInput.focus();

      // Refresh server info to update experiment count
      fetchServerInfo();
    } catch (err) {
      showAlert(err.message || 'Unable to record experiment. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="btn-icon">🚀</span> Record Experiment';
    }
  });

  // -------------------------------------------------------------
  // Initial Boot
  // -------------------------------------------------------------
  fetchHealth();
  fetchServerInfo();
  fetchExperiments();

  // Periodically refresh server telemetry every 30 seconds
  setInterval(() => {
    fetchHealth();
    fetchServerInfo();
  }, 30000);

})();
