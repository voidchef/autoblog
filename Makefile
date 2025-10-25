# Autoblog Docker Makefile
# 
# This Makefile provides convenient commands for Docker operations.
# Run 'make help' to see all available commands.

.PHONY: help build up down logs shell clean test

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Docker Compose files
COMPOSE_DEV := docker-compose.yml docker-compose.dev.yml
COMPOSE_PROD := docker-compose.yml docker-compose.prod.yml
COMPOSE_TEST := docker-compose.yml docker-compose.test.yml

help: ## Show this help message
	@echo '$(BLUE)Autoblog Docker Commands$(NC)'
	@echo ''
	@echo 'Usage:'
	@echo '  $(GREEN)make$(NC) $(YELLOW)<target>$(NC)'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Development Commands
dev: ## Start development environment
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker-compose -f $(COMPOSE_DEV) up

dev-build: ## Build and start development environment
	@echo "$(BLUE)Building and starting development environment...$(NC)"
	docker-compose -f $(COMPOSE_DEV) up --build

dev-down: ## Stop development environment
	@echo "$(YELLOW)Stopping development environment...$(NC)"
	docker-compose -f $(COMPOSE_DEV) down

dev-logs: ## View development logs
	docker-compose -f $(COMPOSE_DEV) logs -f

## Production Commands
prod: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(NC)"
	docker-compose -f $(COMPOSE_PROD) up -d

prod-build: ## Build and start production environment
	@echo "$(BLUE)Building and starting production environment...$(NC)"
	docker-compose -f $(COMPOSE_PROD) up -d --build

prod-down: ## Stop production environment
	@echo "$(YELLOW)Stopping production environment...$(NC)"
	docker-compose -f $(COMPOSE_PROD) down

prod-logs: ## View production logs
	docker-compose -f $(COMPOSE_PROD) logs -f

## Testing Commands
test: ## Run tests in Docker
	@echo "$(BLUE)Running tests...$(NC)"
	docker-compose -f $(COMPOSE_TEST) up --abort-on-container-exit
	@echo "$(GREEN)Tests completed!$(NC)"

test-build: ## Build and run tests
	@echo "$(BLUE)Building and running tests...$(NC)"
	docker-compose -f $(COMPOSE_TEST) up --build --abort-on-container-exit

## Database Commands
db-shell: ## Open MongoDB shell
	@echo "$(BLUE)Opening MongoDB shell...$(NC)"
	docker-compose exec mongo mongosh autoblog

db-backup: ## Backup MongoDB database
	@echo "$(BLUE)Backing up database...$(NC)"
	@mkdir -p ./backups
	docker-compose exec -T mongo mongodump --db autoblog --archive > ./backups/backup-$$(date +%Y%m%d-%H%M%S).archive
	@echo "$(GREEN)Backup completed!$(NC)"

db-restore: ## Restore MongoDB database (usage: make db-restore FILE=backup.archive)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE parameter required. Usage: make db-restore FILE=backup.archive$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Restoring database from $(FILE)...$(NC)"
	docker-compose exec -T mongo mongorestore --db autoblog --archive < $(FILE)
	@echo "$(GREEN)Restore completed!$(NC)"

## Container Management
shell: ## Open shell in app container
	@echo "$(BLUE)Opening shell in app container...$(NC)"
	docker-compose exec app sh

shell-dev: ## Open shell in development app container
	@echo "$(BLUE)Opening shell in development app container...$(NC)"
	docker-compose -f $(COMPOSE_DEV) exec app sh

shell-prod: ## Open shell in production app container
	@echo "$(BLUE)Opening shell in production app container...$(NC)"
	docker-compose -f $(COMPOSE_PROD) exec app sh

logs: ## View all logs (default: dev)
	docker-compose logs -f

logs-app: ## View app logs only
	docker-compose logs -f app

logs-mongo: ## View MongoDB logs only
	docker-compose logs -f mongo

ps: ## List running containers
	docker-compose ps

## Build Commands
build: ## Build Docker images (default: dev)
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker build --target development -t autoblog:dev .

build-prod: ## Build production Docker image
	@echo "$(BLUE)Building production Docker image...$(NC)"
	docker build --target production -t autoblog:prod .

build-no-cache: ## Build without cache
	@echo "$(BLUE)Building Docker images without cache...$(NC)"
	docker build --no-cache --target production -t autoblog:prod .

## Cleanup Commands
down: ## Stop all containers
	@echo "$(YELLOW)Stopping all containers...$(NC)"
	docker-compose down

down-volumes: ## Stop all containers and remove volumes
	@echo "$(RED)Stopping containers and removing volumes...$(NC)"
	docker-compose down -v

clean: ## Remove stopped containers and images
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose down
	docker container prune -f
	docker image prune -f
	@echo "$(GREEN)Cleanup completed!$(NC)"

clean-all: ## Remove everything (containers, images, volumes)
	@echo "$(RED)WARNING: This will remove all containers, images, and volumes!$(NC)"
	@echo "$(RED)Press Ctrl+C to cancel, or wait 5 seconds to continue...$(NC)"
	@sleep 5
	docker-compose down -v
	docker system prune -a -f --volumes
	@echo "$(GREEN)Complete cleanup done!$(NC)"

## Utility Commands
restart: down up ## Restart all services
	@echo "$(GREEN)Services restarted!$(NC)"

restart-app: ## Restart only app service
	@echo "$(BLUE)Restarting app service...$(NC)"
	docker-compose restart app

status: ## Show container status and health
	@echo "$(BLUE)Container Status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(BLUE)Container Health:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

stats: ## Show container resource usage
	docker stats --no-stream

inspect: ## Inspect Docker setup
	@echo "$(BLUE)=== Docker Compose Config ===$(NC)"
	docker-compose config
	@echo ""
	@echo "$(BLUE)=== Images ===$(NC)"
	docker images | grep autoblog
	@echo ""
	@echo "$(BLUE)=== Volumes ===$(NC)"
	docker volume ls | grep autoblog
	@echo ""
	@echo "$(BLUE)=== Networks ===$(NC)"
	docker network ls | grep autoblog

## Health Checks
health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@curl -f http://localhost:3000/health && echo "$(GREEN)✓ App is healthy$(NC)" || echo "$(RED)✗ App is unhealthy$(NC)"
	@docker-compose exec mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1 && echo "$(GREEN)✓ MongoDB is healthy$(NC)" || echo "$(RED)✗ MongoDB is unhealthy$(NC)"

## Installation
install: ## Initial setup - create .env and directories
	@echo "$(BLUE)Setting up project...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file from .env.example...$(NC)"; \
		cp .env.example .env; \
	else \
		echo "$(GREEN).env file already exists$(NC)"; \
	fi
	@mkdir -p data uploads/profile-pictures uploads/templates backups
	@echo "$(GREEN)Setup completed!$(NC)"
	@echo "$(YELLOW)Please edit .env file with your configuration$(NC)"
