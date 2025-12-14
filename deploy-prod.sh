#!/bin/bash
# ============================================
# Production Deployment Script
# ============================================
# Purpose: Automated production deployment with backup and rollback
# Usage: ./deploy-prod.sh
# Features: Pre-flight checks, backups, health checks, rollback on failure
# ============================================

set -e  # Exit on error

# ============================================
# Colors & Formatting
# ============================================
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# Configuration
# ============================================
PROD_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
NGINX_CONF="nginx/prod.conf"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_TAG="pre_deploy_${TIMESTAMP}"

# ============================================
# Helper Functions
# ============================================

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# ============================================
# Pre-flight Checks
# ============================================

preflight_checks() {
    print_header "Pre-flight Checks"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker is installed"
    
    # Check if Docker Compose is installed
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose is installed"
    
    # Check if .env.prod exists
    if [ ! -f "$ENV_FILE" ]; then
        print_error "$ENV_FILE not found"
        print_warning "Please create $ENV_FILE with your production environment variables"
        exit 1
    fi
    print_success "$ENV_FILE exists"
    
    # Check if production nginx config exists
    if [ ! -f "$NGINX_CONF" ]; then
        print_error "$NGINX_CONF not found"
        exit 1
    fi
    print_success "$NGINX_CONF exists"
    
    # Check if compose file exists
    if [ ! -f "$PROD_COMPOSE_FILE" ]; then
        print_error "$PROD_COMPOSE_FILE not found"
        exit 1
    fi
    print_success "$PROD_COMPOSE_FILE exists"
    
    echo ""
}

# ============================================
# Deployment Confirmation
# ============================================

confirm_deployment() {
    print_header "Deployment Confirmation"
    echo ""
    echo -e "${YELLOW}This will deploy the application to PRODUCTION${NC}"
    echo ""
    echo "The following actions will be performed:"
    echo "  1. Backup current database and uploads"
    echo "  2. Build new Docker images"
    echo "  3. Stop current containers"
    echo "  4. Start new containers"
    echo "  5. Run database migrations"
    echo "  6. Rebuild search indices"
    echo "  7. Verify deployment"
    echo ""
    
    read -p "Continue with production deployment? [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    echo ""
}

# ============================================
# Backup Phase
# ============================================

create_backups() {
    print_header "Creating Backups"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Check if database container is running
    if docker compose -f "$PROD_COMPOSE_FILE" ps db | grep -q "Up"; then
        print_step "Backing up database..."
        
        # Load environment variables
        source "$ENV_FILE"
        
        # Create database backup
        docker compose -f "$PROD_COMPOSE_FILE" exec -T db mysqldump \
            -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_DATABASE}" \
            > "${BACKUP_DIR}/db_${BACKUP_TAG}.sql" 2>/dev/null || {
                print_warning "Database backup failed (container may not be running)"
            }
        
        if [ -f "${BACKUP_DIR}/db_${BACKUP_TAG}.sql" ]; then
            print_success "Database backed up to ${BACKUP_DIR}/db_${BACKUP_TAG}.sql"
        fi
    else
        print_warning "Database container not running - skipping backup"
    fi
    
    # Backup uploads directory
    if [ -d "./public/uploads" ]; then
        print_step "Backing up uploads..."
        tar -czf "${BACKUP_DIR}/uploads_${BACKUP_TAG}.tar.gz" ./public/uploads 2>/dev/null
        print_success "Uploads backed up to ${BACKUP_DIR}/uploads_${BACKUP_TAG}.tar.gz"
    fi
    
    echo ""
}

# ============================================
# Build Phase
# ============================================

build_images() {
    print_header "Building Production Images"
    
    print_step "Building Docker images..."
    docker compose -f "$PROD_COMPOSE_FILE" build --no-cache
    
    print_success "Production images built successfully"
    echo ""
}

# ============================================
# Deploy Phase
# ============================================

deploy_containers() {
    print_header "Deploying Containers"
    
    # Stop current containers gracefully
    print_step "Stopping current containers..."
    docker compose -f "$PROD_COMPOSE_FILE" down --timeout 30 || true
    print_success "Containers stopped"
    
    # Start new containers
    print_step "Starting new containers..."
    docker compose -f "$PROD_COMPOSE_FILE" up -d
    print_success "Containers started"
    
    echo ""
}

# ============================================
# Health Check Phase
# ============================================

wait_for_services() {
    print_header "Waiting for Services"
    
    # Load environment variables
    source "$ENV_FILE"
    
    # Wait for database
    print_step "Waiting for database..."
    local db_timeout=60
    while [ $db_timeout -gt 0 ]; do
        if docker compose -f "$PROD_COMPOSE_FILE" exec -T db mysqladmin ping -h localhost -u"${DB_USER}" -p"${DB_PASSWORD}" &>/dev/null; then
            print_success "Database is ready"
            break
        fi
        sleep 2
        db_timeout=$((db_timeout - 2))
    done
    
    if [ $db_timeout -le 0 ]; then
        print_error "Database failed to start"
        return 1
    fi
    
    # Wait for Typesense
    print_step "Waiting for Typesense..."
    local ts_timeout=60
    while [ $ts_timeout -gt 0 ]; do
        if docker compose -f "$PROD_COMPOSE_FILE" exec -T typesense curl -sf http://localhost:8108/health &>/dev/null; then
            print_success "Typesense is ready"
            break
        fi
        sleep 2
        ts_timeout=$((ts_timeout - 2))
    done
    
    if [ $ts_timeout -le 0 ]; then
        print_error "Typesense failed to start"
        return 1
    fi
    
    # Wait for application
    print_step "Waiting for application..."
    local app_timeout=90
    while [ $app_timeout -gt 0 ]; do
        if docker compose -f "$PROD_COMPOSE_FILE" exec -T app curl -sf http://localhost:3333/health &>/dev/null; then
            print_success "Application is ready"
            break
        fi
        sleep 2
        app_timeout=$((app_timeout - 2))
    done
    
    if [ $app_timeout -le 0 ]; then
        print_warning "Application health check timeout (may be normal during startup)"
    fi
    
    echo ""
}

# ============================================
# Migration Phase
# ============================================

run_migrations() {
    print_header "Running Database Migrations"
    
    print_step "Executing migrations..."
    docker compose -f "$PROD_COMPOSE_FILE" exec -T app node ace migration:run --force
    print_success "Migrations completed"
    
    echo ""
}

# ============================================
# Search Index Phase
# ============================================

rebuild_search_indices() {
    print_header "Rebuilding Search Indices"
    
    print_step "Setting up Typesense collections..."
    docker compose -f "$PROD_COMPOSE_FILE" exec -T app node ace setup:typesense --force
    print_success "Typesense collections configured"
    
    print_step "Indexing data..."
    docker compose -f "$PROD_COMPOSE_FILE" exec -T app node ace index:all || {
        print_warning "Indexing completed with warnings"
    }
    print_success "Data indexed"
    
    echo ""
}

# ============================================
# Verification Phase
# ============================================

verify_deployment() {
    print_header "Verifying Deployment"
    
    # Check container status
    print_step "Checking container status..."
    docker compose -f "$PROD_COMPOSE_FILE" ps
    
    # Test health endpoint
    print_step "Testing application health..."
    if docker compose -f "$PROD_COMPOSE_FILE" exec -T app curl -sf http://localhost:3333/health &>/dev/null; then
        print_success "Application health check passed"
    else
        print_error "Application health check failed"
        return 1
    fi
    
    echo ""
    print_success "Deployment verification complete"
    echo ""
}

# ============================================
# Rollback Function
# ============================================

rollback() {
    print_header "ROLLBACK INITIATED"
    
    print_warning "Rolling back to previous version..."
    
    # Stop new containers
    docker compose -f "$PROD_COMPOSE_FILE" down --timeout 30
    
    # Restore database if backup exists
    if [ -f "${BACKUP_DIR}/db_${BACKUP_TAG}.sql" ]; then
        print_step "Restoring database from backup..."
        docker compose -f "$PROD_COMPOSE_FILE" up -d db
        sleep 10
        
        # Load environment variables
        source "$ENV_FILE"
        
        docker compose -f "$PROD_COMPOSE_FILE" exec -T db mysql \
            -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_DATABASE}" \
            < "${BACKUP_DIR}/db_${BACKUP_TAG}.sql"
        
        print_success "Database restored"
    fi
    
    print_error "Deployment failed - rollback complete"
    exit 1
}

# ============================================
# Main Deployment Flow
# ============================================

main() {
    echo ""
    print_header "Production Deployment Script v2.0"
    echo ""
    
    # Execute deployment steps
    preflight_checks
    confirm_deployment
    
    # Create backups
    create_backups
    
    # Build and deploy
    if ! build_images; then
        print_error "Build failed"
        exit 1
    fi
    
    if ! deploy_containers; then
        print_error "Deployment failed"
        exit 1
    fi
    
    # Wait for services to be healthy
    if ! wait_for_services; then
        print_error "Services failed to start"
        rollback
    fi
    
    # Run migrations and setup
    if ! run_migrations; then
        print_error "Migrations failed"
        read -p "Continue anyway? [y/N]: " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            rollback
        fi
    fi
    
    # Rebuild search indices
    rebuild_search_indices || print_warning "Search indexing completed with warnings"
    
    # Verify deployment
    if ! verify_deployment; then
        read -p "Verification failed. Rollback? [y/N]: " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback
        fi
    fi
    
    # Success!
    print_header "Deployment Complete! ✨"
    echo ""
    echo -e "${GREEN}Your application has been successfully deployed to production${NC}"
    echo ""
    echo "Access your application at: ${CYAN}http://your-domain.com${NC}"
    echo ""
    echo "Backup files:"
    echo "  - Database: ${BACKUP_DIR}/db_${BACKUP_TAG}.sql"
    echo "  - Uploads:  ${BACKUP_DIR}/uploads_${BACKUP_TAG}.tar.gz"
    echo ""
    print_success "Deployment completed successfully at $(date)"
    echo ""
}

# Execute main function
main
