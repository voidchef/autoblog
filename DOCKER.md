# Docker Setup Guide

This document describes the Docker setup for the Autoblog project.

## Overview

The project uses a multi-stage Docker build process with separate configurations for development, production, and testing environments.

## Prerequisites

- Docker Engine 20.10+ or Docker Desktop
- Docker Compose v2.0+
- At least 4GB RAM available for Docker

## Architecture

### Multi-Stage Dockerfile

The Dockerfile uses multiple stages for optimization:

1. **base** - Installs pnpm and sets up Node.js environment
2. **backend-builder** - Compiles TypeScript backend code
3. **frontend-builder** - Builds React frontend application
4. **development** - Development environment with hot reload
5. **production** - Optimized production image with minimal footprint

### Services

- **mongo** - MongoDB 7 database
- **app** - Node.js application (backend + frontend)

## Quick Start

### Development

```bash
# Start development environment
pnpm docker:dev

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# With rebuild
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Features:
- Hot reload for backend (via TypeScript watch mode)
- Hot reload for frontend (via Vite dev server)
- Source code mounted as volumes
- MongoDB data persisted locally in `./data`
- Ports: 3000 (backend), 5173 (frontend), 27018 (MongoDB)

### Production

```bash
# Start production environment
pnpm docker:prod

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# With rebuild
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Features:
- Optimized build with production dependencies only
- Non-root user for security
- Resource limits (2 CPU cores, 2GB RAM)
- Health checks enabled
- Read-only root filesystem
- MongoDB with authentication

### Testing

```bash
# Run tests in Docker
pnpm docker:test

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.test.yml up

# Run and exit
docker-compose -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit
```

Features:
- Isolated test database (tmpfs for speed)
- Coverage reports mounted to `./coverage`
- Automatic cleanup after tests

## Environment Variables

Create a `.env` file in the project root:

```env
# Application
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# MongoDB (Production)
MONGO_USERNAME=admin
MONGO_PASSWORD=your-secure-password

# MongoDB Connection
MONGODB_URL=mongodb://mongo:27017/autoblog

# Add other environment variables as needed
```

## Docker Commands

### Build

```bash
# Build specific stage
docker build --target production -t autoblog:prod .
docker build --target development -t autoblog:dev .

# Build with no cache
docker build --no-cache --target production -t autoblog:prod .
```

### Run Individual Containers

```bash
# Run MongoDB only
docker-compose up mongo

# Run app only (requires MongoDB running)
docker-compose up app

# Run in detached mode
docker-compose up -d
```

### Manage Containers

```bash
# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f app
docker-compose logs -f mongo

# Execute commands in running container
docker-compose exec app sh
docker-compose exec mongo mongosh
```

### Cleanup

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup (use with caution)
docker system prune -a --volumes
```

## Volume Management

### Named Volumes (Production)

- `mongo-data-prod` - Production MongoDB data
- `mongo-data` - Development MongoDB data

### Bind Mounts (Development)

- `./src` → `/usr/src/app/src` - Backend source code
- `./front` → `/usr/src/app/front` - Frontend source code
- `./uploads` → `/usr/src/app/uploads` - User uploads
- `./data` → `/data/db` - MongoDB data

## Health Checks

### Application Health Check

The production container includes a health check that polls `/health` endpoint every 30 seconds.

```bash
# Check container health
docker-compose ps
docker inspect autoblog-prod | grep -A 10 Health
```

### MongoDB Health Check

MongoDB health is checked using `mongosh` ping command.

## Security Best Practices

1. **Non-root User**: Production container runs as user `nodejs` (UID 1001)
2. **Read-only Filesystem**: Production container has read-only root filesystem
3. **Resource Limits**: CPU and memory limits prevent resource exhaustion
4. **MongoDB Authentication**: Enabled in production environment
5. **No Exposed Ports**: MongoDB not exposed externally in production

## Optimization Features

1. **Layer Caching**: Dependencies installed before source code copy
2. **Multi-stage Build**: Separate build and runtime stages
3. **pnpm**: Uses pnpm for faster, more efficient package management
4. **Frozen Lockfile**: Ensures reproducible builds
5. **Production Dependencies**: Only production deps in final image
6. **Alpine Linux**: Minimal base image (~50MB vs ~900MB)

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# or
netstat -tuln | grep 3000

# Kill the process or change PORT in .env
```

### MongoDB Connection Issues

```bash
# Check MongoDB logs
docker-compose logs mongo

# Verify MongoDB is healthy
docker-compose ps

# Connect to MongoDB shell
docker-compose exec mongo mongosh
```

### Permission Issues (Linux)

```bash
# Fix file permissions
sudo chown -R $USER:$USER ./data ./uploads

# Or run with sudo (not recommended)
sudo docker-compose up
```

### Build Failures

```bash
# Clear build cache
docker builder prune

# Rebuild from scratch
docker-compose build --no-cache

# Check disk space
docker system df
```

### Container Memory Issues

```bash
# Increase Docker Desktop memory limit (Preferences → Resources)
# Or reduce resource limits in docker-compose.prod.yml

# Check container stats
docker stats autoblog-prod
```

## Performance Tips

1. **Use BuildKit**: Set `DOCKER_BUILDKIT=1` for faster builds
2. **Prune Regularly**: Clean up unused images/containers weekly
3. **Volume Performance**: Use named volumes instead of bind mounts in production
4. **Multi-core Builds**: BuildKit uses all available CPU cores
5. **Registry Cache**: Use a Docker registry for layer caching in CI/CD

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build Docker image
  run: docker build --target production -t autoblog:${{ github.sha }} .

- name: Run tests
  run: docker-compose -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit

- name: Push to registry
  run: |
    docker tag autoblog:${{ github.sha }} registry.example.com/autoblog:latest
    docker push registry.example.com/autoblog:latest
```
