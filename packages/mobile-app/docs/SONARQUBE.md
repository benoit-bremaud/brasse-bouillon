# SonarQube — Local Analysis Guide

This document explains how to run SonarQube locally using Docker to analyze the **brasse-bouillon-frontend** project.

> **Scope:** local only — no VPS or CI integration for SonarQube.  
> For real-time feedback in VS Code, install the [SonarLint](#sonarlint-vs-code) extension instead.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- `sonar-scanner` CLI available (see [installation](#install-sonar-scanner))
- Node.js 22+ (to generate the coverage report)

---

## 1. Start SonarQube via Docker

```bash
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  sonarqube:community
```

Wait ~30 seconds for SonarQube to boot, then open: <http://localhost:9000>

**Default credentials:**

| Field    | Value |
| -------- | ----- |
| Username | admin |
| Password | admin |

> You will be prompted to change the password on first login.

---

## 2. Create the project in SonarQube

1. Go to **Projects → Create project manually**
2. Set **Project key**: `brasse-bouillon-frontend`
3. Set **Display name**: `Brasse Bouillon Frontend`
4. Choose **Locally** as the analysis method
5. Generate a **token** and save it (used in step 4)

---

## 3. Generate the coverage report

```bash
npm run test:coverage
```

This produces `coverage/lcov.info`, which SonarQube will pick up automatically (configured in `sonar-project.properties`).

---

## 4. Install sonar-scanner

### Option A — npm global (recommended)

```bash
npm install -g sonar-scanner
```

### Option B — Docker (no installation needed)

```bash
docker run \
  --rm \
  --network=host \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=<YOUR_TOKEN>
```

---

## 5. Run the analysis

```bash
sonar-scanner \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=<YOUR_TOKEN>
```

> Replace `<YOUR_TOKEN>` with the token generated in step 2.  
> All other settings are read from `sonar-project.properties` at the root of the project.

Results will be available at: <http://localhost:9000/dashboard?id=brasse-bouillon-frontend>

---

## 6. Stop / clean up SonarQube

```bash
# Stop the container
docker stop sonarqube

# Remove the container (data is lost)
docker rm sonarqube
```

To **persist data** between runs, use a named volume:

```bash
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

---

## SonarLint (VS Code)

For real-time analysis without running SonarQube:

1. Install the extension: **SonarLint** (`sonarsource.sonarlint-vscode`)  
   → Already listed in `.vscode/extensions.json` — VS Code will suggest it automatically.
2. No configuration needed for standalone mode; SonarLint will analyze files on save.

To connect SonarLint to the local SonarQube instance (optional — enables shared rule sets):

1. Open VS Code Settings → **SonarLint: Connected Mode**
2. Add a connection pointing to `http://localhost:9000`
3. Bind the workspace to the project key `brasse-bouillon-frontend`

---

## sonar-project.properties reference

| Property                            | Value                                          |
| ----------------------------------- | ---------------------------------------------- |
| `sonar.projectKey`                  | `brasse-bouillon-frontend`                     |
| `sonar.sources`                     | `src,app`                                      |
| `sonar.exclusions`                  | `node_modules`, `__tests__`, `mocks`, `*.d.ts` |
| `sonar.tests`                       | `src`                                          |
| `sonar.test.inclusions`             | `**/__tests__/**/*.test.ts(x)`                 |
| `sonar.javascript.lcov.reportPaths` | `coverage/lcov.info`                           |
