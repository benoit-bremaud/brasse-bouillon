# ==============================================================================
# Brasse-Bouillon — Monorepo Makefile
# ==============================================================================

SONAR_CONTAINER := vsea-sonarqube
SONAR_IMAGE     := sonarqube:lts-community
SONAR_PORT      := 9000
SONAR_URL       := http://localhost:$(SONAR_PORT)

.PHONY: help sonar-start sonar-stop sonar-status sonar-scan

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

## ============================================================================
## @SonarQube
## ============================================================================

sonar-start: ## Start local SonarQube server (Docker, port 9000) — creates container on first run
	@if docker ps -a --format '{{.Names}}' | grep -q '^$(SONAR_CONTAINER)$$'; then \
		echo "[sonar] Starting existing container..."; \
		docker start $(SONAR_CONTAINER); \
	else \
		echo "[sonar] Creating and starting SonarQube container..."; \
		docker run -d --name $(SONAR_CONTAINER) -p $(SONAR_PORT):9000 \
			-v ci_sonarqube_data:/opt/sonarqube/data \
			-v ci_sonarqube_extensions:/opt/sonarqube/extensions \
			-v ci_sonarqube_logs:/opt/sonarqube/logs \
			$(SONAR_IMAGE); \
	fi
	@echo "[sonar] Waiting for SonarQube to be ready at $(SONAR_URL) ..."
	@until curl -sf $(SONAR_URL)/api/system/status | grep -q '"status":"UP"'; do \
		printf '.'; sleep 3; \
	done
	@echo ""
	@echo "[sonar] SonarQube is UP → $(SONAR_URL)"

sonar-stop: ## Stop local SonarQube server (container is kept, data preserved)
	docker stop $(SONAR_CONTAINER)
	@echo "[sonar] SonarQube stopped."

sonar-status: ## Show local SonarQube server status
	@if docker ps --format '{{.Names}}' | grep -q '^$(SONAR_CONTAINER)$$'; then \
		echo "[sonar] Container: running"; \
		curl -sf $(SONAR_URL)/api/system/status && echo || echo "[sonar] HTTP not yet ready"; \
	elif docker ps -a --format '{{.Names}}' | grep -q '^$(SONAR_CONTAINER)$$'; then \
		echo "[sonar] Container: stopped (run 'make sonar-start' to resume)"; \
	else \
		echo "[sonar] Container: not found (run 'make sonar-start' to create)"; \
	fi

sonar-scan: ## Run SonarQube analysis against local server (requires SONAR_TOKEN env var)
	@if [ -z "$(SONAR_TOKEN)" ]; then \
		echo "Error: SONAR_TOKEN is required."; \
		echo "Usage: make sonar-scan SONAR_TOKEN=sqp_xxxx"; \
		exit 1; \
	fi
	SONAR_TOKEN=$(SONAR_TOKEN) bash tools/ci/sonar-scan.sh
