# syntax=docker/dockerfile:1
# Build context: monorepo root (brasse-bouillon/)
# docker build -f packages/api/Dockerfile -t brasse-bouillon-api:local .

FROM node:20-bookworm-slim AS build

WORKDIR /app

# Native dependencies (e.g. better-sqlite3) may need a toolchain.
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    python3 \
  && rm -rf /var/lib/apt/lists/*

# Copy root manifests — the canonical package-lock.json lives at the repo root
# (per-workspace lockfiles are blocked by .gitignore since incident #674).
# Only the api package.json is needed; other workspace members (mobile-app,
# website, beer-encyclopedia) are absent from the build context and npm will
# skip their workspace symlinks without error.
COPY package.json package-lock.json ./
COPY packages/api/package.json packages/api/

# --ignore-scripts is intentionally omitted: better-sqlite3 requires its native
# build scripts (node-gyp) to run during install.
RUN npm ci

# Copy API source files only.
COPY packages/api/nest-cli.json packages/api/tsconfig*.json packages/api/
COPY packages/api/src packages/api/src

RUN npm run build -w packages/api

# Keep only production dependencies in the final image.
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV PORT=3000
ENV NODE_ENV=production

COPY --from=build /app/node_modules              ./node_modules
COPY --from=build /app/packages/api/dist         ./dist
COPY --from=build /app/packages/api/package.json ./

RUN mkdir -p data && chown -R node:node data

# Persist application data (SQLite DB by default lives under /app/data).
# Mount a named volume at /app/data in production to avoid losing the DB on container recreation.
VOLUME ["/app/data"]

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e 'const port = process.env.PORT || 3000; const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 2000); fetch(`http://127.0.0.1:${port}/health`, { signal: controller.signal }).then((r) => { clearTimeout(timer); process.exit(r.ok ? 0 : 1); }).catch(() => process.exit(1));'

CMD ["node", "dist/main"]
