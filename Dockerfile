# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build

WORKDIR /app

# Native dependencies (e.g. better-sqlite3) may need a toolchain.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY nest-cli.json tsconfig*.json ./
COPY src ./src
RUN npm run build

# Keep only production dependencies in the final image.
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV PORT=3000
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

RUN mkdir -p data && chown -R node:node data

USER node

EXPOSE 3000

CMD ["node", "dist/main"]
