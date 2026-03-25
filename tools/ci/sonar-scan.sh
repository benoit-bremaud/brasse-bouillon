#!/usr/bin/env bash
# ==============================================================================
# Brasse-Bouillon — SonarQube local scan
# Runs sonar-scanner-cli via Docker against the local SonarQube instance.
#
# Usage:
#   SONAR_TOKEN=sqp_xxxx bash tools/ci/sonar-scan.sh
#   make sonar-scan SONAR_TOKEN=sqp_xxxx
# ==============================================================================
set -euo pipefail

SONAR_URL="${SONAR_HOST_URL:-http://localhost:9000}"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if [ -z "${SONAR_TOKEN:-}" ]; then
  echo "Error: SONAR_TOKEN environment variable is required."
  echo "Generate one at ${SONAR_URL}/account/security"
  exit 1
fi

echo "[sonar-scan] Project root: ${PROJECT_ROOT}"
echo "[sonar-scan] SonarQube URL: ${SONAR_URL}"
echo "[sonar-scan] Starting analysis..."

docker run --rm \
  --network host \
  -e SONAR_HOST_URL="${SONAR_URL}" \
  -e SONAR_TOKEN="${SONAR_TOKEN}" \
  -v "${PROJECT_ROOT}:/usr/src" \
  sonarsource/sonar-scanner-cli:latest

echo "[sonar-scan] Analysis complete. View results at ${SONAR_URL}/dashboard?id=brasse-bouillon"
