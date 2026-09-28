# ANTI-GRAVITY — Gravity Simulation &amp; Experiment Portal

> **Cloud Computing & DevOps (CCA 2) Project**  
> An original, interactive web application simulating gravitational acceleration across celestial bodies, recording experimental telemetry, and integrating continuous integration and deployment (CI/CD) pipelines.

---

## 🚀 Application Purpose

The **ANTI-GRAVITY Portal** allows users to explore how gravitational force varies across different worlds in our solar system. Users can define an object or person, specify mass ($kg$) and release elevation ($m$), choose a celestial destination, and calculate the object's surface weight in Newtons ($N$) according to Newton's Second Law and Universal Gravitation:

$$\text{Weight} = \text{Mass} \times \text{Gravitational Acceleration}\quad (W = m \cdot g)$$

The application stores submitted experiments dynamically in server memory, displays live telemetry and comparative metrics against Earth's gravity, and provides a programmatic REST API for integration and monitoring.

---

## ✨ Features

- **Interactive Physics Engine**: Real-time calculation of surface weight ($N$), potential energy ($J$), and ratio relative to Earth's standard gravity.
- **Predefined Celestial Catalog**:
  - **Earth**: $9.81\text{ m/s}^2$ (Standard 1.00×)
  - **Moon**: $1.62\text{ m/s}^2$ (~0.165× Earth)
  - **Mars**: $3.71\text{ m/s}^2$ (~0.378× Earth)
  - **Jupiter**: $24.79\text{ m/s}^2$ (~2.527× Earth)
  - **Venus**: $8.87\text{ m/s}^2$ (~0.904× Earth)
- **Live Form Preview**: Instant calculation as inputs are typed before submission.
- **In-Memory Experiment Archive**: Stores and updates simulation records in memory without requiring an external database.
- **Real-Time Telemetry & Statistics**: Shows total experiments, average weight, and maximum recorded weight with instant table filtering.
- **Server Health & Diagnostics**: Dedicated `/health` endpoint and `/api/server-info` exposing server uptime, Node.js version, and commit telemetry.
- **Render Git Commit Integration**: Automatically extracts and displays the deployed Git commit ID in the website footer using the `RENDER_GIT_COMMIT` environment variable.
- **High Accessibility (a11y)**: Semantic HTML5 landmarks, clear label-input associations, keyboard navigable controls, and high-contrast space theme.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js (v20+ LTS recommended) |
| **Backend Framework** | Express.js 4.x |
| **Frontend** | HTML5, CSS3 (Custom Dark Space Design System), Vanilla JavaScript (ES2022) |
| **Testing** | Node.js Built-in Test Runner (`node:test`, `node:assert/strict`) |
| **Code Quality** | ESLint 9 (Flat Configuration) |
| **Containerization** | Docker (`node:20-alpine`) |
| **Version Control** | Git & GitHub |
| **Automation / CI/CD** | GitHub Actions (`.github/workflows/ci-cd.yml`) |
| **Cloud Deployment** | Render Web Service |

---

## 📁 Project Structure

```text
anti-gravity-project/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions workflow (Lint -> Test -> Deploy)
├── public/
│   ├── index.html             # Accessible space-themed single page interface
│   ├── style.css              # Custom responsive dark-mode styling
│   └── script.js              # Client-side validation, live preview & API interaction
├── test/
│   └── app.test.js            # Automated test suite using node:test
├── .dockerignore              # Files excluded from Docker container image
├── .gitignore                 # Files excluded from Git version control
├── Dockerfile                 # Container image specification (Node 20 Alpine)
├── app.js                     # Main Express server, API routes, and validation logic
├── eslint.config.js           # ESLint 9 configuration file
├── package.json               # NPM scripts, metadata, and dependencies
├── package-lock.json          # Dependency lockfile
└── README.md                  # Comprehensive project documentation
```

---

## 💻 Local Setup & Development

### Prerequisites
- [Node.js](https://nodejs.org/) v20.x or newer
- [npm](https://www.npmjs.com/) v10.x or newer
- [Docker](https://www.docker.com/) (optional, for containerized execution)

### 1. Installation
Clone or navigate to the project directory and install dependencies:

```bash
npm install
```

### 2. Running the Application
Start the server locally:

```bash
npm start
```

The portal will be accessible at:
- **Web Interface**: `http://localhost:3000`
- **Health Endpoint**: `http://localhost:3000/health`
- **API Experiments**: `http://localhost:3000/api/experiments`
- **Server Telemetry**: `http://localhost:3000/api/server-info`

To specify a custom port:
```bash
PORT=4000 npm start
```
*(On Windows PowerShell: `$env:PORT="4000"; npm start`)*

---

## 🧪 Testing & Code Quality

### Running Automated Tests
The project uses the built-in Node.js test runner (`node:test` and `node:assert/strict`), avoiding unnecessary external testing dependencies:

```bash
npm test
```

The automated test suite verifies:
1. `GET /health` returns HTTP 200 and `{"status":"ok"}`.
2. `POST /api/experiments` with valid data creates an experiment and calculates weight correctly ($W = m \cdot g$).
3. `POST /api/experiments` with missing payload returns HTTP 400 with a descriptive JSON error.
4. Validation rules: Rejecting zero or negative mass, negative height, unsupported planets, or blank names.
5. `GET /api/experiments` returns the array of stored experiments.
6. `GET /api/server-info` exposes runtime telemetry and Git commit metadata.
7. `GET /` serves the HTML frontend.

### Running Lint
Verify code quality and style standards with ESLint:

```bash
npm run lint
```

---

## 🐳 Docker Containerization

The application includes a lightweight, secure Dockerfile based on `node:20-alpine` with an integrated non-root user and container health check.

### Build the Docker Image
```bash
docker build -t anti-gravity-app .
```

### Run the Docker Container
```bash
docker run -d -p 3000:3000 --name anti-gravity-container anti-gravity-app
```

Verify that the container is running and healthy:
```bash
docker ps
curl http://localhost:3000/health
```

Stop and remove the container:
```bash
docker stop anti-gravity-container
docker rm anti-gravity-container
```

---

## 🌐 API Endpoints

### 1. Health Probe
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Lightweight health check for uptime monitors and orchestrators.
- **Response**: `200 OK`
  ```json
  {
    "status": "ok"
  }
  ```

### 2. List Experiments
- **URL**: `/api/experiments`
- **Method**: `GET`
- **Description**: Returns all experiments stored in server memory.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "Apollo Lunar Sample",
      "mass": 15,
      "height": 1.5,
      "planet": "Moon",
      "gravity": 1.62,
      "weight": 24.3,
      "potentialEnergy": 36.45,
      "createdAt": "2026-09-28T06:33:00.000Z"
    }
  ]
  ```

### 3. Record Experiment
- **URL**: `/api/experiments`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Perseverance Rover",
    "mass": 1025,
    "height": 2.2,
    "planet": "Mars"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 4,
    "name": "Perseverance Rover",
    "mass": 1025,
    "height": 2.2,
    "planet": "Mars",
    "gravity": 3.71,
    "weight": 3802.75,
    "potentialEnergy": 8366.05,
    "createdAt": "2026-09-28T07:35:00.000Z"
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "error": "Mass must be a positive number greater than 0."
  }
  ```

### 4. Server Telemetry
- **URL**: `/api/server-info`
- **Method**: `GET`
- **Description**: Exposes system runtime details, uptime, and deployed commit ID.
- **Response**: `200 OK`
  ```json
  {
    "appName": "ANTI-GRAVITY — Gravity Simulation & Experiment Portal",
    "version": "1.0.0",
    "nodeVersion": "v20.x.x",
    "uptimeSeconds": 142,
    "serverTime": "2026-09-28T07:35:00.000Z",
    "environment": "production",
    "gitCommit": "7a3f8b1",
    "totalExperiments": 4,
    "planets": [...]
  }
  ```

---

## ⚙️ Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port on which the HTTP server listens. |
| `NODE_ENV` | `development` | Node runtime environment (`development` or `production`). |
| `RENDER_GIT_COMMIT` | `development` | Provided automatically by Render to display the active Git commit in the footer. |

---

## 🔄 CI/CD & GitHub Actions Workflow

The continuous integration and continuous deployment pipeline is defined in `.github/workflows/ci-cd.yml`.

### Pipeline Stages:
1. **Trigger**:
   - Pushes to the `main` branch.
   - Pull Requests targeting the `main` branch.
2. **Quality Checks (`quality-checks` job)**:
   - Checks out repository source code.
   - Sets up Node.js 20 with npm caching.
   - Executes clean dependency installation via `npm ci`.
   - Runs `npm run lint` (ESLint 9).
   - Runs `npm test` (Node.js test suite).
3. **Automated Deployment (`deploy-to-render` job)**:
   - Executes **only** if all quality checks pass.
   - Executes **only** on push events to `main` (not PRs).
   - Secures the deployment webhook URL in the repository secret `RENDER_DEPLOY_HOOK`.
   - Invokes the Render Deploy Hook via `curl` to trigger an instant zero-downtime deployment.

---

## ☁️ Render Deployment Guide

Follow these steps to deploy the application on Render as a Web Service:

1. **Push your code to GitHub**:
   Ensure your code is committed to a GitHub repository on the `main` branch.
2. **Create a Web Service on Render**:
   - Sign in to [Render](https://dashboard.render.com/).
   - Click **New +** &rarr; **Web Service**.
   - Connect your GitHub repository.
3. **Configure Service Settings**:
   - **Name**: `anti-gravity-portal`
   - **Region**: Select your preferred region.
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. **Obtain Deploy Hook URL**:
   - In your Render Web Service dashboard, navigate to **Settings** &rarr; **Deploy Hook**.
   - Copy the unique deploy hook URL (`https://api.render.com/deploy/srv-xxxx?key=yyyy`).
5. **Configure GitHub Actions Secret**:
   - In your GitHub repository, navigate to:  
     **Settings** &rarr; **Secrets and variables** &rarr; **Actions** &rarr; **New repository secret**.
   - **Name**: `RENDER_DEPLOY_HOOK`
   - **Secret**: Paste the copied Render deploy hook URL.
   - Save the secret.

Every subsequent push to `main` will automatically trigger the GitHub Actions workflow, validate quality checks, and trigger deployment on Render!

---

## 🌿 Git Workflow

Recommended workflow for developing features and submitting changes:

```bash
# 1. Check status
git status

# 2. Create and switch to a feature branch
git checkout -b feature/experiment-enhancements

# 3. Make changes and verify locally
npm run lint
npm test

# 4. Stage and commit changes
git add .
git commit -m "feat: enhance gravitational simulation calculations"

# 5. Switch to main and merge (or open a Pull Request)
git checkout main
git merge feature/experiment-enhancements

# 6. Push to GitHub to trigger CI/CD pipeline
git push origin main
```

---

## 📜 Academic Integrity & Attribution

This project is built from scratch as an original solution for the Cloud Computing & DevOps Assessment (CCA 2). It features an independent architecture, custom astrophysics physics calculation engine, accessible dark space user interface, and zero third-party dependencies outside Express and ESLint.
