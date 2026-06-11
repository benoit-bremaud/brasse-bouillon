# ==============================================================================
# Brasse-Bouillon — Monorepo Makefile
# ==============================================================================

# Shared self-hosted SonarQube (Community Build + PostgreSQL) — managed in
# its own repo; this Makefile only delegates. All four are overridable from
# the environment (`?=`) so another machine layout needs no repo edit.
SONARQUBE_STACK_DIR ?= $(HOME)/Documents/02_personal/sonarqube-stack
SONAR_PORT          ?= 9000
SONAR_URL           ?= http://localhost:$(SONAR_PORT)
SONAR_TOKEN_FILE    ?= $(HOME)/.config/sonar-tokens/brasse-bouillon

BEER_ENC_PORT := 8000
BEER_ENC_DIR  := packages/beer-encyclopedia
COMPOSE_BEER_ENC := docker compose -f $(BEER_ENC_DIR)/docker-compose.yml

# LAN IP used so Expo Go (phone) can reach the API running on this machine.
# Detection order: macOS (ipconfig Wi-Fi en0 / Ethernet en1) → Linux
# (hostname -I) → localhost fallback. `hostname -I` does not exist on
# macOS and its pipeline exits 0 with empty output, so it cannot be the
# first probe.
LAN_IP := $(shell \
	ipconfig getifaddr en0 2>/dev/null \
	|| ipconfig getifaddr en1 2>/dev/null \
	|| (command -v hostname >/dev/null && hostname -I 2>/dev/null | awk 'NF{print $$1; exit}') \
	|| echo localhost)
LAN_IP := $(if $(strip $(LAN_IP)),$(LAN_IP),localhost)

# Tailscale IPv4 — preferred over LAN_IP when available because router AP
# isolation can block LAN-to-LAN traffic between the dev machine and the
# phone. Falls back to LAN_IP, then localhost. Both use `?=` so a
# developer can opt out (e.g. `make DEV_HOST=192.168.1.244 dev-mobile`
# or `export DEV_HOST=...`) without editing the Makefile.
TAILSCALE_IP ?= $(shell tailscale ip -4 2>/dev/null | head -n1)
DEV_HOST ?= $(if $(strip $(TAILSCALE_IP)),$(TAILSCALE_IP),$(LAN_IP))

API_PORT := 3000

.PHONY: help setup \
        dev dev-api dev-mobile dev-beer-enc dev-all dev-stop \
        db-up db-down db-logs \
        migrate-api migrate-api-revert \
        migrate-beer-enc migrate-beer-enc-revert \
        test-all lint-all \
        sonar-start sonar-stop sonar-status sonar-scan \
        docker-build docker-up docker-down docker-logs

help: ## Show this help
	@printf '\nBrasse-Bouillon — common dev commands\n'
	@printf '======================================\n\n'
	@printf 'Quick start (first time on this machine):\n'
	@printf '  \033[36mmake setup\033[0m                    Create local .env files with safe defaults\n'
	@printf '  \033[36mmake dev-all\033[0m                  Start everything: database, API, beer encyclopedia, mobile app\n'
	@printf '  \033[36mmake dev-stop\033[0m                 Stop every dev server and Docker container (databases are preserved)\n\n'
	@printf 'Daily dev (one server per terminal):\n'
	@printf '  \033[36mmake dev-api\033[0m                  Start the main API (NestJS, http://localhost:3000)\n'
	@printf '  \033[36mmake dev-mobile\033[0m               Start the mobile app for Expo Go (scan QR code on phone)\n'
	@printf '  \033[36mmake dev-beer-enc\033[0m             Start the beer encyclopedia API (Python, http://localhost:8000)\n'
	@printf '  \033[36mmake dev\033[0m                      Shortcut: API + mobile in parallel\n\n'
	@printf 'Database (only needed for the beer encyclopedia):\n'
	@printf '  \033[36mmake db-up\033[0m                    Start the local Postgres database (Docker)\n'
	@printf '  \033[36mmake db-down\033[0m                  Stop the local Postgres database (data is kept)\n'
	@printf '  \033[36mmake db-logs\033[0m                  Show live database logs\n\n'
	@printf 'Migrations (apply schema changes):\n'
	@printf '  \033[36mmake migrate-api\033[0m              Apply pending migrations on the main API\n'
	@printf '  \033[36mmake migrate-api-revert\033[0m       Roll back the last main API migration\n'
	@printf '  \033[36mmake migrate-beer-enc\033[0m         Apply pending migrations on the beer encyclopedia\n'
	@printf '  \033[36mmake migrate-beer-enc-revert\033[0m  Roll back the last beer encyclopedia migration\n\n'
	@printf 'Quality gates:\n'
	@printf '  \033[36mmake test-all\033[0m                 Run all test suites (mobile + API + beer encyclopedia)\n'
	@printf '  \033[36mmake lint-all\033[0m                 Run all linters\n'
	@printf '  \033[36mmake sonar-start\033[0m              Start the shared self-hosted SonarQube (sonarqube-stack)\n'
	@printf '  \033[36mmake sonar-scan\033[0m               Run a SonarQube scan (token auto-read, or SONAR_TOKEN=sqp_xxx)\n'
	@printf '  \033[36mmake sonar-stop\033[0m               Stop the shared SonarQube (affects all local projects)\n'
	@printf '  \033[36mmake sonar-status\033[0m             Show shared SonarQube server status\n\n'
	@printf 'Docker — API (production container):\n'
	@printf '  \033[36mmake docker-build\033[0m             Build the API Docker image locally\n'
	@printf '  \033[36mmake docker-up\033[0m                Start the API container (detached, restart: unless-stopped)\n'
	@printf '  \033[36mmake docker-down\033[0m              Stop and remove the API container\n'
	@printf '  \033[36mmake docker-logs\033[0m              Follow API container logs (Ctrl+C to exit)\n\n'

## ============================================================================
## @Dev environment
## ============================================================================

setup: ## Create local .env files with safe defaults
	@echo "[setup] Detected LAN IP:       $(LAN_IP)"
	@echo "[setup] Detected Tailscale IP: $(if $(strip $(TAILSCALE_IP)),$(TAILSCALE_IP),(none))"
	@echo "[setup] Using DEV_HOST:        $(DEV_HOST)"
	@if [ ! -f packages/api/.env ]; then \
		echo "[setup] Creating packages/api/.env from .env.example ..."; \
		cp packages/api/.env.example packages/api/.env; \
		SECRET=$$(openssl rand -hex 32 2>/dev/null || echo "dev-secret-please-replace-me-32chars"); \
		sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$$SECRET|" packages/api/.env && rm -f packages/api/.env.bak; \
		echo "[setup] JWT_SECRET generated."; \
	else \
		echo "[setup] packages/api/.env already exists — left untouched."; \
	fi
	@if [ ! -f packages/mobile-app/.env ]; then \
		echo "[setup] Creating packages/mobile-app/.env pointing at http://$(DEV_HOST):$(API_PORT) ..."; \
		printf "# Auto-generated by make setup — API URL uses the machine reachable IP\n# (Tailscale preferred, LAN fallback) so Expo Go on a phone can reach the backend.\nEXPO_PUBLIC_API_URL=http://$(DEV_HOST):$(API_PORT)\nEXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL=http://$(DEV_HOST):$(BEER_ENC_PORT)\nEXPO_PUBLIC_USE_DEMO_DATA=false\n" > packages/mobile-app/.env; \
	else \
		echo "[setup] packages/mobile-app/.env already exists — left untouched."; \
	fi
	@if [ ! -f $(BEER_ENC_DIR)/.env ]; then \
		echo "[setup] Creating $(BEER_ENC_DIR)/.env from .env.example ..."; \
		cp $(BEER_ENC_DIR)/.env.example $(BEER_ENC_DIR)/.env; \
		PG_USER="beer_enc_local"; \
		PG_PASS=$$(openssl rand -hex 16 2>/dev/null || python3 -c 'import secrets; print(secrets.token_hex(16))' 2>/dev/null || uuidgen 2>/dev/null || echo "CHANGE_ME_PLEASE_RUN_SETUP"); \
		sed -i.bak \
			"s|CHANGE_ME_POSTGRES_USER|$$PG_USER|g; \
			 s|CHANGE_ME_POSTGRES_PASSWORD|$$PG_PASS|g" \
			$(BEER_ENC_DIR)/.env && rm -f $(BEER_ENC_DIR)/.env.bak; \
		echo "[setup] Postgres user '$$PG_USER' and a fresh password generated."; \
	else \
		echo "[setup] $(BEER_ENC_DIR)/.env already exists — left untouched."; \
	fi
	@echo "[setup] Done. Next: 'make dev-api' in one terminal, 'make dev-mobile' in another."
	@echo "[setup]        Or run 'make dev-all' to start everything at once."

dev-api: ## Start the NestJS API in watch mode (http://DEV_HOST:3000)
	@echo "[dev-api] API will be reachable at http://$(DEV_HOST):$(API_PORT)"
	npm run dev:api

dev-mobile: ## Start Expo for Expo Go — Metro bound to Tailscale (or LAN) IP
	@echo "[dev-mobile] Metro will advertise host: $(DEV_HOST)"
	@echo "[dev-mobile] Phone must reach $(DEV_HOST):8081 (Tailscale tailnet, or same Wi-Fi without AP isolation)."
	REACT_NATIVE_PACKAGER_HOSTNAME=$(DEV_HOST) npm -w packages/mobile-app run start:lan

dev-beer-enc: ## Start the beer-encyclopedia FastAPI server (http://localhost:8000)
	@if [ ! -x $(BEER_ENC_DIR)/.venv/bin/uvicorn ]; then \
		echo "[dev-beer-enc] .venv/bin/uvicorn not found."; \
		echo "[dev-beer-enc] Run: cd $(BEER_ENC_DIR) && python -m venv .venv && .venv/bin/pip install -e \".[ml,dev]\""; \
		exit 1; \
	fi
	@echo "[dev-beer-enc] FastAPI on http://localhost:$(BEER_ENC_PORT) and http://$(DEV_HOST):$(BEER_ENC_PORT) — Swagger at /docs"
	cd $(BEER_ENC_DIR) && .venv/bin/uvicorn api.main:app --reload --host 0.0.0.0 --port $(BEER_ENC_PORT)

dev: ## Start API and Expo in parallel (Ctrl+C stops both)
	@echo "[dev] Starting API + Expo — API at http://$(DEV_HOST):$(API_PORT), Metro on $(DEV_HOST):8081"
	@trap 'kill 0' INT TERM; \
		(npm run dev:api) & \
		(REACT_NATIVE_PACKAGER_HOSTNAME=$(DEV_HOST) npm -w packages/mobile-app run start:lan) & \
		wait

dev-all: setup db-up ## Start the whole stack: Postgres + NestJS API + beer-encyclopedia + Expo
	@if [ ! -x $(BEER_ENC_DIR)/.venv/bin/uvicorn ]; then \
		echo "[dev-all] .venv/bin/uvicorn not found."; \
		echo "[dev-all] Run: cd $(BEER_ENC_DIR) && python -m venv .venv && .venv/bin/pip install -e \".[ml,dev]\""; \
		exit 1; \
	fi
	@echo "[dev-all] Running migrations..."
	@$(MAKE) -s migrate-api
	@$(MAKE) -s migrate-beer-enc
	@echo "[dev-all] Starting API + beer-encyclopedia + Expo — Ctrl+C stops all (host: $(DEV_HOST))"
	@trap 'kill 0' INT TERM; \
		(npm run dev:api) & \
		(cd $(BEER_ENC_DIR) && .venv/bin/uvicorn api.main:app --reload --host 0.0.0.0 --port $(BEER_ENC_PORT)) & \
		(REACT_NATIVE_PACKAGER_HOSTNAME=$(DEV_HOST) npm -w packages/mobile-app run start:lan) & \
		wait

dev-stop: ## Stop dev servers (ports 3000/8000/8081) and beer-encyclopedia Postgres (data preserved)
	@echo "[dev-stop] Killing processes on ports $(API_PORT), $(BEER_ENC_PORT), 8081..."
	@for port in $(API_PORT) $(BEER_ENC_PORT) 8081; do \
		pids=$$(lsof -ti :$$port 2>/dev/null); \
		if [ -n "$$pids" ]; then \
			echo "[dev-stop] Killing PID(s) $$pids on port $$port"; \
			kill $$pids 2>/dev/null || true; \
		fi; \
	done
	@echo "[dev-stop] Stopping beer-encyclopedia Docker containers (data preserved)..."
	@$(COMPOSE_BEER_ENC) stop 2>/dev/null || true
	@echo "[dev-stop] Done."

test-all: ## Run mobile-app + api + beer-encyclopedia test suites
	npm run test:all
	@if [ -x $(BEER_ENC_DIR)/.venv/bin/pytest ]; then \
		echo "[test-all] Running beer-encyclopedia pytest ..."; \
		(cd $(BEER_ENC_DIR) && .venv/bin/pytest -q); \
	elif command -v pytest >/dev/null 2>&1; then \
		echo "[test-all] Running beer-encyclopedia pytest (system pytest) ..."; \
		(cd $(BEER_ENC_DIR) && pytest -q); \
	else \
		echo "[test-all] SKIP beer-encyclopedia — no .venv/ nor system pytest found."; \
		echo "            Run 'pip install -e \".[ml,dev]\"' in $(BEER_ENC_DIR) to enable."; \
	fi

lint-all: ## Run mobile-app and api linters
	npm run lint:all

## ============================================================================
## @Database (beer-encyclopedia Postgres only — NestJS uses SQLite)
## ============================================================================

db-up: ## Start the local Postgres database for beer-encyclopedia (Docker)
	@echo "[db-up] Starting beer-encyclopedia Postgres..."
	@err=$$($(COMPOSE_BEER_ENC) up -d --wait postgres 2>&1); rc=$$?; \
	if [ $$rc -eq 0 ]; then \
		echo "[db-up] Postgres is healthy."; \
	elif echo "$$err" | grep -qi "unknown flag\|unrecognized\|\-\-wait"; then \
		echo "[db-up] --wait not supported, using polling fallback..."; \
		$(COMPOSE_BEER_ENC) up -d postgres || exit 1; \
		timeout=60; elapsed=0; \
		until docker inspect --format '{{.State.Health.Status}}' beer-encyclopedia-postgres 2>/dev/null | grep -q '^healthy$$'; do \
			printf '.'; sleep 2; elapsed=$$((elapsed + 2)); \
			if [ $$elapsed -ge $$timeout ]; then \
				echo ""; echo "[db-up] ERROR: Postgres did not become healthy within $$timeout s."; exit 1; \
			fi; \
		done; \
		echo ""; echo "[db-up] Postgres is healthy."; \
	else \
		echo "[db-up] ERROR: docker compose failed:"; echo "$$err"; exit 1; \
	fi

db-down: ## Stop the local Postgres database (data is kept)
	$(COMPOSE_BEER_ENC) stop postgres
	@echo "[db-down] Postgres stopped. Data volumes preserved."

db-logs: ## Show live Postgres logs (Ctrl+C to exit)
	$(COMPOSE_BEER_ENC) logs -f postgres

## ============================================================================
## @Migrations
## ============================================================================

migrate-api: ## Apply pending TypeORM migrations on the main API (NestJS/SQLite)
	npm -w packages/api run migration:run

migrate-api-revert: ## Roll back the last TypeORM migration on the main API
	npm -w packages/api run migration:revert

migrate-beer-enc: ## Apply pending Alembic migrations on the beer-encyclopedia (Postgres)
	@if [ ! -x $(BEER_ENC_DIR)/.venv/bin/alembic ]; then \
		echo "[migrate-beer-enc] .venv/bin/alembic not found — run: cd $(BEER_ENC_DIR) && python -m venv .venv && .venv/bin/pip install -e "[ml,dev]""; \
		exit 1; \
	fi
	cd $(BEER_ENC_DIR) && .venv/bin/alembic upgrade head

migrate-beer-enc-revert: ## Roll back the last Alembic migration on the beer-encyclopedia
	@if [ ! -x $(BEER_ENC_DIR)/.venv/bin/alembic ]; then \
		echo "[migrate-beer-enc-revert] .venv/bin/alembic not found — run: cd $(BEER_ENC_DIR) && python -m venv .venv && .venv/bin/pip install -e "[ml,dev]""; \
		exit 1; \
	fi
	cd $(BEER_ENC_DIR) && .venv/bin/alembic downgrade -1

## ============================================================================
## @SonarQube
## ============================================================================

sonar-start: ## Start the SHARED self-hosted SonarQube (delegates to the sonarqube-stack repo)
	@if [ ! -d "$(SONARQUBE_STACK_DIR)" ]; then \
		echo "[sonar] sonarqube-stack repo not found at $(SONARQUBE_STACK_DIR)"; \
		echo "[sonar] Clone it: git clone git@github.com:benoit-bremaud/sonarqube-stack.git"; \
		exit 1; \
	fi
	$(MAKE) -C "$(SONARQUBE_STACK_DIR)" up
	@echo "[sonar] Waiting for SonarQube to be ready at $(SONAR_URL) (max 2 min) ..."
	@attempts=0; \
	until curl -sf $(SONAR_URL)/api/system/status | grep -q '"status":"UP"'; do \
		attempts=$$((attempts + 1)); \
		if [ $$attempts -ge 40 ]; then \
			echo ""; \
			echo "[sonar] Gave up after 2 min — check the stack: make -C \"$(SONARQUBE_STACK_DIR)\" status"; \
			exit 1; \
		fi; \
		printf '.'; sleep 3; \
	done
	@echo ""
	@echo "[sonar] SonarQube is UP → $(SONAR_URL)"

sonar-stop: ## Stop the SHARED SonarQube instance (affects every project on this machine)
	@if [ ! -d "$(SONARQUBE_STACK_DIR)" ]; then \
		echo "[sonar] sonarqube-stack repo not found at $(SONARQUBE_STACK_DIR) — nothing to stop from here."; \
		exit 1; \
	fi
	@echo "[sonar] Note: this instance is SHARED by all local projects."
	$(MAKE) -C "$(SONARQUBE_STACK_DIR)" down

sonar-status: ## Show the shared SonarQube server status
	@curl -sf $(SONAR_URL)/api/system/status && echo \
		|| echo "[sonar] Not reachable at $(SONAR_URL) (run 'make sonar-start')"

sonar-scan: ## Run a SonarQube analysis (token auto-read from ~/.config/sonar-tokens/brasse-bouillon)
	@TOKEN="$(SONAR_TOKEN)"; \
	if [ -z "$$TOKEN" ] && [ -f "$(SONAR_TOKEN_FILE)" ]; then \
		TOKEN=$$(cat "$(SONAR_TOKEN_FILE)"); \
	fi; \
	if [ -z "$$TOKEN" ]; then \
		echo "Error: SONAR_TOKEN is required."; \
		echo "Either: make sonar-scan SONAR_TOKEN=sqp_xxxx"; \
		echo "Or store the project analysis token in $(SONAR_TOKEN_FILE) (chmod 600)."; \
		exit 1; \
	fi; \
	SONAR_TOKEN=$$TOKEN bash tools/ci/sonar-scan.sh

## ============================================================================
## @Docker (API)
## ============================================================================

docker-build: ## Build the API Docker image via Compose (tags it as the image: value)
	docker compose -f packages/api/docker-compose.yml build

docker-up: ## Start the API container in production mode (detached)
	docker compose -f packages/api/docker-compose.yml up -d

docker-down: ## Stop and remove the API container
	docker compose -f packages/api/docker-compose.yml down

docker-logs: ## Follow API container logs (Ctrl+C to exit)
	docker compose -f packages/api/docker-compose.yml logs -f api
