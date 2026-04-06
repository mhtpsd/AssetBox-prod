# Multi-stage build for Kafka Workers
FROM node:20-alpine AS base
RUN npm install -g npm@10

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/workers/package.json ./apps/workers/
COPY packages/database/package.json ./packages/database/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
RUN npm ci --workspace=@assetbox/workers --include-workspace-root

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate --workspace=@assetbox/database 2>/dev/null || true
RUN npm run build --workspace=@assetbox/workers

# ---- Production ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker

# Copy built artifacts and runtime dependencies
COPY --from=builder --chown=worker:nodejs /app/apps/workers/dist ./dist
COPY --from=builder --chown=worker:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=worker:nodejs /app/packages ./packages
COPY --from=builder --chown=worker:nodejs /app/apps/workers/package.json ./package.json

USER worker

# Workers is a Kafka microservice — no HTTP port to expose
CMD ["node", "dist/src/main"]
