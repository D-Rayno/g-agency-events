# ============================================
# Makefile for Docker Development & Production
# ============================================
# Optimized for separate dev/prod workflows
# Version: 2.0
# ============================================

.PHONY: help
.DEFAULT_GOAL := help

# ============================================
# Colors & Formatting
# ============================================
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
CYAN := \033[0;36m
MAGENTA := \033[0;35m
NC := \033[0m

# ============================================
# Configuration
# ============================================
DEV_COMPOSE_FILE := docker-compose.dev.yml
PROD_COMPOSE_FILE := docker-compose.prod.yml
PROJECT_NAME := zevent

# Load environment variables
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# ============================================
# Help
# ============================================
help: ## Show this help message
	@echo "$(BLUE)════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Zevent Events Platform - Docker Commands$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(CYAN)Development Commands:$(NC)"
	@grep -E '^dev-[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(MAGENTA)Production Commands:$(NC)"
	@grep -E '^prod-[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(CYAN)Database Commands:$(NC)"
	@grep -E '^db-[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(CYAN)Utility Commands:$(NC)"
	@grep -E '^(logs|health|info|clean-all|backup):.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ============================================
# DEVELOPMENT ENVIRONMENT
# ============================================

dev-build: ## Build development images
	@echo "$(BLUE)Building development images...$(NC)"
	@docker compose -f $(DEV_COMPOSE_FILE) build
	@echo "$(GREEN)✓ Development images built$(NC)"

dev-up: ## Start development environment
	@echo "$(BLUE)Starting development environment...$(NC)"
	@docker compose -f $(DEV_COMPOSE_FILE) up -d
	@echo "$(GREEN)✓ Development environment started$(NC)"
	@sleep 5
	@make dev-status

dev-down: ## Stop development environment
	@echo "$(BLUE)Stopping development environment...$(NC)"
	@docker compose -f $(DEV_COMPOSE_FILE) down
	@echo "$(GREEN)✓ Development environment stopped$(NC)"

dev-restart: ## Restart development services
	@echo "$(BLUE)Restarting development services...$(NC)"
	@docker compose -f $(DEV_COMPOSE_FILE) restart
	@echo "$(GREEN)✓ Development services restarted$(NC)"

dev-logs: ## View development application logs
	@docker compose -f $(DEV_COMPOSE_FILE) logs -f app

dev-logs-all: ## View all development service logs
	@docker compose -f $(DEV_COMPOSE_FILE) logs -f

dev-shell: ## Access development container shell
	@docker compose -f $(DEV_COMPOSE_FILE) exec app sh

dev-status: ## Show development services status
	@echo "$(BLUE)Development Services:$(NC)"
	@docker compose -f $(DEV_COMPOSE_FILE) ps

dev-clean: ## Remove development containers and volumes
	@echo "$(RED)⚠️  Removing development containers and volumes...$(NC)"
	@docker compose -f $(DEV_COMPOSE_FILE) down -v
	@echo "$(GREEN)✓ Development cleanup complete$(NC)"

dev-setup: dev-build dev-up ## Complete development setup
	@echo "$(BLUE)Waiting for services to be ready...$(NC)"
	@sleep 15
	@make db-migrate COMPOSE_FILE=$(DEV_COMPOSE_FILE) || echo "$(YELLOW)⚠️  Migration skipped$(NC)"
	@make db-seed COMPOSE_FILE=$(DEV_COMPOSE_FILE) || echo "$(YELLOW)⚠️  Seeding skipped$(NC)"
	@echo "$(GREEN)╔════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║   Development Setup Complete! ✨       ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════╝$(NC)"
	@make dev-info

dev-info: ## Show development access information
	@echo ""
	@echo "$(BLUE)🌐 Development Access Points:$(NC)"
	@echo "  $(GREEN)Application:$(NC)  http://localhost:${NGINX_PORT:-8080}"
	@echo "  $(GREEN)Direct App:$(NC)   http://localhost:${PORT:-3333}"
	@echo "  $(GREEN)MySQL:$(NC)        localhost:${DB_PORT:-3307}"
	@echo "  $(GREEN)Typesense:$(NC)    http://localhost:${TYPESENSE_PORT:-8109}"
	@echo ""

# ============================================
# PRODUCTION ENVIRONMENT
# ============================================

prod-build: ## Build production images
	@echo "$(BLUE)Building production images...$(NC)"
	@docker compose -f $(PROD_COMPOSE_FILE) build
	@echo "$(GREEN)✓ Production images built$(NC)"

prod-up: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(NC)"
	@docker compose -f $(PROD_COMPOSE_FILE) up -d
	@echo "$(GREEN)✓ Production environment started$(NC)"
	@sleep 5
	@make prod-status

prod-down: ## Stop production environment
	@echo "$(BLUE)Stopping production environment...$(NC)"
	@docker compose -f $(PROD_COMPOSE_FILE) down
	@echo "$(GREEN)✓ Production environment stopped$(NC)"

prod-restart: ## Restart production services
	@echo "$(BLUE)Restarting production services...$(NC)"
	@docker compose -f $(PROD_COMPOSE_FILE) restart
	@echo "$(GREEN)✓ Production services restarted$(NC)"

prod-logs: ## View production application logs
	@docker compose -f $(PROD_COMPOSE_FILE) logs -f app

prod-logs-all: ## View all production service logs
	@docker compose -f $(PROD_COMPOSE_FILE) logs -f

prod-shell: ## Access production container shell
	@docker compose -f $(PROD_COMPOSE_FILE) exec app sh

prod-status: ## Show production services status
	@echo "$(BLUE)Production Services:$(NC)"
	@docker compose -f $(PROD_COMPOSE_FILE) ps

prod-clean: ## Remove production containers and volumes
	@echo "$(RED)⚠️  Removing production containers and volumes...$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
		docker compose -f $(PROD_COMPOSE_FILE) down -v; \
		echo "$(GREEN)✓ Production cleanup complete$(NC)"; \
	fi

prod-deploy: ## Full production deployment
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║   Production Deployment                ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@make prod-build
	@make prod-down || true
	@make prod-up
	@echo "$(BLUE)⏳ Waiting for services to be healthy (20s)...$(NC)"
	@sleep 20
	@make db-migrate COMPOSE_FILE=$(PROD_COMPOSE_FILE)
	@make typesense-setup COMPOSE_FILE=$(PROD_COMPOSE_FILE)
	@echo "$(GREEN)✅ Production deployment complete$(NC)"
	@make prod-info

prod-info: ## Show production access information
	@echo ""
	@echo "$(BLUE)🌐 Production Access Points:$(NC)"
	@echo "  $(GREEN)Application:$(NC)  http://localhost:${NGINX_HTTP_PORT:-80}"
	@echo ""
	@echo "$(YELLOW)⚠️  Services are internal - only accessible via Nginx$(NC)"
	@echo ""

# ============================================
# DATABASE OPERATIONS
# ============================================

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running migrations...$(NC)"
	@COMPOSE_FILE=$${COMPOSE_FILE:-$(DEV_COMPOSE_FILE)}; \
	docker compose -f $$COMPOSE_FILE exec -T app node ace migration:run --force
	@echo "$(GREEN)✓ Migrations complete$(NC)"

db-seed: ## Seed database
	@echo "$(BLUE)Seeding database...$(NC)"
	@COMPOSE_FILE=$${COMPOSE_FILE:-$(DEV_COMPOSE_FILE)}; \
	docker compose -f $$COMPOSE_FILE exec -T app node ace db:seed
	@echo "$(GREEN)✓ Seeding complete$(NC)"

db-reset: ## Reset database (rollback + migrate + seed)
	@echo "$(YELLOW)⚠️  Resetting database...$(NC)"
	@COMPOSE_FILE=$${COMPOSE_FILE:-$(DEV_COMPOSE_FILE)}; \
	docker compose -f $$COMPOSE_FILE exec -T app node ace migration:rollback --force && \
	docker compose -f $$COMPOSE_FILE exec -T app node ace migration:run --force && \
	docker compose -f $$COMPOSE_FILE exec -T app node ace db:seed
	@echo "$(GREEN)✓ Database reset complete$(NC)"

db-shell: ## Access MySQL shell
	@COMPOSE_FILE=$${COMPOSE_FILE:-$(DEV_COMPOSE_FILE)}; \
	docker compose -f $$COMPOSE_FILE exec db mysql -u$${DB_USER} -p$${DB_PASSWORD} $${DB_DATABASE}

db-backup: ## Backup database to file
	@echo "$(BLUE)📦 Creating database backup...$(NC)"
	@mkdir -p ./backups
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	COMPOSE_FILE=$${COMPOSE_FILE:-$(DEV_COMPOSE_FILE)}; \
	docker compose -f $$COMPOSE_FILE exec -T db mysqldump \
		-u$${DB_USER} -p$${DB_PASSWORD} $${DB_DATABASE} \
		> ./backups/db_backup_$$timestamp.sql && \
	echo "$(GREEN)✓ Backup saved: ./backups/db_backup_$$timestamp.sql$(NC)"

db-restore: ## Restore database from backup
	@echo "$(YELLOW)Available backups:$(NC)"
	@ls -1 ./backups/db_backup_*.sql 2>/dev/null || echo "No backups found"
	@read -p "Enter backup filename: " backup; \
	if [ -f "./backups/$$backup" ]; then \
		COMPOSE_FILE=$${COMPOSE_FILE:-$(DEV_COMPOSE_FILE)}; \
		docker compose -f $$COMPOSE_FILE exec -T db mysql \
			-u$${DB_USER} -p$${DB_PASSWORD} $${DB_DATABASE} \
			< ./backups/$$backup && \
		echo "$(GREEN)✓ Database restored$(NC)"; \
	else \
		echo "$(RED)✗ Backup not found$(NC)"; \
	fi

# ============================================
# TYPESENSE OPERATIONS
# ============================================

typesense-setup: ## Setup Typesense collections
	@echo "$(BLUE)Setting up Typesense...$(NC)"
	@COMPOSE_FILE=$${COMPOSE_FILE:-$(DEV_COMPOSE_FILE)}; \
	docker compose -f $$COMPOSE_FILE exec -T app node ace setup:typesense --force
	@echo "$(GREEN)✓ Typesense setup complete$(NC)"

typesense-index: ## Reindex all data
	@echo "$(BLUE)Indexing data...$(NC)"
	@COMPOSE_FILE=$${COMPOSE_FILE:-$(DEV_COMPOSE_FILE)}; \
	docker compose -f $$COMPOSE_FILE exec -T app node ace index:all
	@echo "$(GREEN)✓ Indexing complete$(NC)"

typesense-reset: ## Reset Typesense collections
	@echo "$(YELLOW)⚠️  Resetting Typesense collections...$(NC)"
	@make typesense-setup
	@make typesense-index
	@echo "$(GREEN)✅ Typesense reset complete$(NC)"

# ============================================
# UTILITY COMMANDS
# ============================================

logs: dev-logs ## Alias for dev-logs

health: ## Check service health
	@echo "$(BLUE)Service Health Check:$(NC)"
	@echo ""
	@echo "$(CYAN)Development:$(NC)"
	@docker compose -f $(DEV_COMPOSE_FILE) ps 2>/dev/null || echo "  $(YELLOW)Development not running$(NC)"
	@echo ""
	@echo "$(MAGENTA)Production:$(NC)"
	@docker compose -f $(PROD_COMPOSE_FILE) ps 2>/dev/null || echo "  $(YELLOW)Production not running$(NC)"

info: dev-info ## Alias for dev-info

stats: ## Show container resource usage
	@echo "$(BLUE)Container Resource Usage:$(NC)"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

clean-all: ## Nuclear cleanup (all Docker resources)
	@echo "$(RED)╔════════════════════════════════════════╗$(NC)"
	@echo "$(RED)║   ⚠️  NUCLEAR CLEANUP WARNING ⚠️       ║$(NC)"
	@echo "$(RED)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)This will remove ALL Docker resources including:$(NC)"
	@echo "  - All development containers and volumes"
	@echo "  - All production containers and volumes"
	@echo "  - All project images"
	@echo "  - All unused Docker resources"
	@echo ""
	@read -p "Type 'DELETE EVERYTHING' to confirm: " confirm; \
	if [ "$$confirm" = "DELETE EVERYTHING" ]; then \
		echo "$(RED)Cleaning development environment...$(NC)"; \
		docker compose -f $(DEV_COMPOSE_FILE) down -v --remove-orphans 2>/dev/null || true; \
		echo "$(RED)Cleaning production environment...$(NC)"; \
		docker compose -f $(PROD_COMPOSE_FILE) down -v --remove-orphans 2>/dev/null || true; \
		echo "$(RED)Removing project images...$(NC)"; \
		docker images | grep zevent | awk '{print $$3}' | xargs -r docker rmi -f 2>/dev/null || true; \
		echo "$(RED)Pruning Docker system...$(NC)"; \
		docker system prune -af --volumes; \
		echo "$(GREEN)✅ Nuclear cleanup complete$(NC)"; \
	else \
		echo "$(YELLOW)Aborted.$(NC)"; \
	fi

backup: db-backup ## Alias for db-backup

# ============================================
# DIAGNOSTIC COMMANDS
# ============================================

doctor: ## Run system diagnostics
	@echo "$(BLUE)╔════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║   System Diagnostics                   ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)1. Docker versions:$(NC)"
	@docker --version
	@docker compose version
	@echo ""
	@echo "$(YELLOW)2. Environment files:$(NC)"
	@if [ -f .env ]; then echo "  $(GREEN)✓ .env exists$(NC)"; else echo "  $(RED)✗ .env missing$(NC)"; fi
	@if [ -f .env.prod ]; then echo "  $(GREEN)✓ .env.prod exists$(NC)"; else echo "  $(RED)✗ .env.prod missing$(NC)"; fi
	@if [ -f $(DEV_COMPOSE_FILE) ]; then echo "  $(GREEN)✓ $(DEV_COMPOSE_FILE) exists$(NC)"; else echo "  $(RED)✗ $(DEV_COMPOSE_FILE) missing$(NC)"; fi
	@if [ -f $(PROD_COMPOSE_FILE) ]; then echo "  $(GREEN)✓ $(PROD_COMPOSE_FILE) exists$(NC)"; else echo "  $(RED)✗ $(PROD_COMPOSE_FILE) missing$(NC)"; fi
	@echo ""
	@echo "$(YELLOW)3. Nginx configurations:$(NC)"
	@if [ -f nginx/dev.conf ]; then echo "  $(GREEN)✓ nginx/dev.conf exists$(NC)"; else echo "  $(RED)✗ nginx/dev.conf missing$(NC)"; fi
	@if [ -f nginx/prod.conf ]; then echo "  $(GREEN)✓ nginx/prod.conf exists$(NC)"; else echo "  $(RED)✗ nginx/prod.conf missing$(NC)"; fi
	@echo ""
	@echo "$(YELLOW)4. Container status:$(NC)"
	@docker ps --filter "name=zevent" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  $(YELLOW)No zevent containers running$(NC)"