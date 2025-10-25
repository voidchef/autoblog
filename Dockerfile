# Base stage - install pnpm
FROM node:20-alpine AS base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Development stage - build backend
FROM base AS backend-builder

# Copy dependency files for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY src ./src

# Compile TypeScript
RUN pnpm compile

# Frontend builder stage
FROM base AS frontend-builder

WORKDIR /usr/src/app/front

# Copy frontend dependency files
COPY front/package.json front/pnpm-lock.yaml ./

# Install frontend dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source and config
COPY front ./

# Build frontend
RUN pnpm build

# Development stage
FROM base AS development

WORKDIR /usr/src/app

ENV NODE_ENV=development

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json ecosystem.config.json ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY src ./src

# Copy frontend for development
COPY front ./front

# Expose default port
EXPOSE 3000

CMD ["pnpm", "dev"]

# Production stage
FROM base AS production

WORKDIR /usr/prod/app

ENV NODE_ENV=production

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ecosystem.config.json ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy compiled backend from builder
COPY --from=backend-builder /usr/src/app/dist ./dist

# Copy built frontend from builder
COPY --from=frontend-builder /usr/src/app/front/dist ./front/dist

# Copy uploads directory structure (create if needed)
RUN mkdir -p uploads/profile-pictures uploads/templates

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /usr/prod/app

USER nodejs

# Expose default port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

CMD ["pnpm", "start"]
