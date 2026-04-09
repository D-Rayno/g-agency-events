# ============================================
# Production-Ready Multi-Stage Dockerfile for AdonisJS + Inertia + React
# ============================================
# Build targets:
#   - development: For local dev with bind mounts (includes dev dependencies)
#   - production: Minimal image for deployment (production dependencies only)
# ============================================

# ============================================
# Stage 1: Base Image
# ============================================
FROM node:22.16.0-alpine3.22 AS base

# Install system dependencies required for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    dumb-init \
    curl \
    bash \
    git

WORKDIR /app

# ============================================
# Stage 2: Dependencies (Development)
# ============================================
FROM base AS dependencies

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev dependencies)
# This layer is cached unless package files change
RUN npm ci --legacy-peer-deps --no-audit --no-fund && \
    npm cache clean --force

# ============================================
# Stage 3: Development Target
# ============================================
FROM dependencies AS development

# Set development environment
ENV NODE_ENV=development

# Copy all source files
COPY . .

# Make scripts executable
RUN chmod +x scripts/*.sh 2>/dev/null || true && \
    chmod +x scripts/*.cjs 2>/dev/null || true

# Create necessary directories
RUN mkdir -p \
    logs \
    tmp \
    public/uploads/avatars \
    public/uploads/events

# Expose development port
EXPOSE 3333

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3333/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Development command with hot module reloading
CMD ["npm", "run", "dev"]

# ============================================
# Stage 4: Build (Production Compilation)
# ============================================
FROM dependencies AS build

# Copy configuration files
COPY adonisrc.ts tsconfig.json vite.config.ts ./
COPY eslint.config.js theme.config.json ./

# Copy source code
COPY app/ ./app/
COPY config/ ./config/
COPY database/ ./database/
COPY start/ ./start/
COPY commands/ ./commands/
COPY resources/ ./resources/
COPY inertia/ ./inertia/
COPY public/ ./public/
COPY bin/ ./bin/
COPY ace.js ./

# Copy scripts directory
COPY scripts/ ./scripts/

# Make scripts executable
RUN chmod +x scripts/*.sh 2>/dev/null || true && \
    chmod +x scripts/*.cjs 2>/dev/null || true

# Set build environment
ENV NODE_ENV=production

# Generate theme configuration
RUN echo "🎨 Generating theme..." && \
    node scripts/generate-theme.cjs

# Build application (TypeScript + Vite)
RUN echo "🔨 Building application..." && \
    node ace build --ignore-ts-errors

# Verify critical build artifacts
RUN echo "🔍 Verifying build..." && \
    test -f "build/bin/server.js" || (echo "❌ Server build failed" && exit 1) && \
    test -f "build/package.json" || (echo "❌ Package.json missing" && exit 1) && \
    test -d "build/public/assets" || (echo "❌ Assets missing" && exit 1) && \
    echo "✅ Build verification passed"

# Copy scripts to build directory
RUN cp -r scripts build/ && \
    chmod +x build/scripts/*.sh 2>/dev/null || true

# Copy public uploads to build directory
RUN mkdir -p build/public/uploads && \
    cp -r public/uploads/* build/public/uploads/ 2>/dev/null || true

# ============================================
# Stage 5: Production Dependencies
# ============================================
FROM base AS production-deps

WORKDIR /app

# Copy package files from build output
COPY --from=build /app/build/package.json ./
COPY --from=build /app/build/package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps --no-audit --no-fund && \
    npm cache clean --force

# ============================================
# Stage 6: Production Runtime
# ============================================
FROM node:22.16.0-alpine3.22 AS production

# Install minimal runtime dependencies
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    curl \
    bash

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Create necessary directories with proper permissions
RUN mkdir -p \
    logs \
    tmp \
    public/uploads/avatars \
    public/uploads/events \
    public/assets && \
    chown -R nodejs:nodejs /app

# Copy production dependencies
COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=nodejs:nodejs /app/build ./

# Ensure scripts are executable
RUN chmod +x scripts/*.sh 2>/dev/null || true

# Switch to non-root user
USER nodejs

# Set production environment
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

# Expose application port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3333/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["node", "bin/server.js"]
