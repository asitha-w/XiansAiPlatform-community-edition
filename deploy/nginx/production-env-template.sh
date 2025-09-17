#!/bin/bash

# XiansAi Production Environment Configuration Helper
# This script helps configure the main application for production use with Nginx proxy

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Load nginx configuration
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "Error: nginx/.env file not found!"
    echo "Please run the nginx setup first."
    exit 1
fi

source "$SCRIPT_DIR/.env"

log "🔧 Configuring XiansAi services for production with Nginx proxy..."
log "Domain: $DOMAIN"

# Create production environment file for root
log "Creating root .env.production..."
cat > "$PROJECT_ROOT/.env.production" << EOF
# XiansAi Production Configuration with Nginx Proxy
VERSION=latest
ENV_POSTFIX=production
COMPOSE_PROJECT_NAME=xians-community-edition

# Domain Configuration
DOMAIN=$DOMAIN

# External Ports (disabled when using Nginx proxy)
# Set to empty to disable external port binding
SERVER_EXTERNAL_PORT=
UI_EXTERNAL_PORT=

# Memory Limits for Production
MONGO_MEMORY_LIMIT=1G
MONGO_MEMORY_RESERVATION=512M
SERVER_MEMORY_LIMIT=2G
SERVER_MEMORY_RESERVATION=1G
UI_MEMORY_LIMIT=512M
UI_MEMORY_RESERVATION=256M

# Logging Configuration
LOGGING_DRIVER=json-file
LOG_MAX_SIZE=100m
LOG_MAX_FILE=5

# Network Configuration
ASPNETCORE_ENV=Production
EOF

# Update server environment for production
log "Updating server environment for production..."
if [ -f "$PROJECT_ROOT/server/.env.local" ]; then
    cp "$PROJECT_ROOT/server/.env.local" "$PROJECT_ROOT/server/.env.production"
    
    # Update server configuration for production
    sed -i.bak "s|ASPNETCORE_ENVIRONMENT=Development|ASPNETCORE_ENVIRONMENT=Production|" "$PROJECT_ROOT/server/.env.production"
    sed -i.bak "s|http://localhost:18080|https://auth.$DOMAIN|g" "$PROJECT_ROOT/server/.env.production"
    sed -i.bak "s|http://keycloak:8080|http://keycloak:8080|g" "$PROJECT_ROOT/server/.env.production"
    sed -i.bak "s|http://localhost:3001|https://$DOMAIN|g" "$PROJECT_ROOT/server/.env.production"
    sed -i.bak "s|http://localhost:5173|https://$DOMAIN|g" "$PROJECT_ROOT/server/.env.production"
    
    # Update CORS for production
    sed -i.bak "s|Cors__AllowedOrigins__1=.*|Cors__AllowedOrigins__1=https://$DOMAIN|" "$PROJECT_ROOT/server/.env.production"
    sed -i.bak "s|Cors__AllowedOrigins__2=.*|Cors__AllowedOrigins__2=https://www.$DOMAIN|" "$PROJECT_ROOT/server/.env.production"
    
    # Clean up backup files
    rm -f "$PROJECT_ROOT/server/.env.production.bak"
    
    success "Server environment configured for production"
else
    warning "server/.env.local not found - you may need to run create-secrets.sh first"
fi

# Update UI environment for production
log "Updating UI environment for production..."
if [ -f "$PROJECT_ROOT/ui/.env.local" ]; then
    cp "$PROJECT_ROOT/ui/.env.local" "$PROJECT_ROOT/ui/.env.production"
    
    # Update UI configuration for production
    sed -i.bak "s|localhost:5001|api.$DOMAIN|g" "$PROJECT_ROOT/ui/.env.production"
    sed -i.bak "s|localhost:18080|auth.$DOMAIN|g" "$PROJECT_ROOT/ui/.env.production"
    sed -i.bak "s|http://|https://|g" "$PROJECT_ROOT/ui/.env.production"
    
    # Clean up backup files
    rm -f "$PROJECT_ROOT/ui/.env.production.bak"
    
    success "UI environment configured for production"
else
    warning "ui/.env.local not found"
fi

# Update Keycloak environment for production
log "Updating Keycloak environment for production..."
if [ -f "$PROJECT_ROOT/keycloak/.env.local" ]; then
    cp "$PROJECT_ROOT/keycloak/.env.local" "$PROJECT_ROOT/keycloak/.env.production"
    
    # Update Keycloak configuration for production
    sed -i.bak "s|HOST_IP=localhost|HOST_IP=$DOMAIN|" "$PROJECT_ROOT/keycloak/.env.production"
    sed -i.bak "s|UI_HOST_URL=http://.*|UI_HOST_URL=https://$DOMAIN|" "$PROJECT_ROOT/keycloak/.env.production"
    sed -i.bak "s|UI_DEV_HOST_URL=http://.*|UI_DEV_HOST_URL=https://$DOMAIN|" "$PROJECT_ROOT/keycloak/.env.production"
    sed -i.bak "s|TEMPORAL_UI_HOST_URL=http://.*|TEMPORAL_UI_HOST_URL=https://temporal.$DOMAIN|" "$PROJECT_ROOT/keycloak/.env.production"
    
    # Clean up backup files
    rm -f "$PROJECT_ROOT/keycloak/.env.production.bak"
    
    success "Keycloak environment configured for production"
else
    warning "keycloak/.env.local not found"
fi

# Update Temporal environment for production
log "Updating Temporal environment for production..."
if [ -f "$PROJECT_ROOT/temporal/.env.local" ]; then
    cp "$PROJECT_ROOT/temporal/.env.local" "$PROJECT_ROOT/temporal/.env.production"
    success "Temporal environment configured for production"
else
    warning "temporal/.env.local not found"
fi

# Update PostgreSQL environment for production
log "Updating PostgreSQL environment for production..."
if [ -f "$PROJECT_ROOT/postgresql/.env.local" ]; then
    cp "$PROJECT_ROOT/postgresql/.env.local" "$PROJECT_ROOT/postgresql/.env.production"
    success "PostgreSQL environment configured for production"
else
    warning "postgresql/.env.local not found"
fi

echo
success "✅ Production environment configuration completed!"
echo
log "📋 Summary:"
log "   • Root environment: .env.production created"
log "   • Server environment: server/.env.production configured"
log "   • UI environment: ui/.env.production configured"
log "   • Keycloak environment: keycloak/.env.production configured"
log "   • External ports disabled (Nginx proxy will handle routing)"
log "   • HTTPS URLs configured for $DOMAIN"
echo
log "🚀 Next steps:"
log "   1. Start XiansAi services: ENV_POSTFIX=production ./start-all.sh"
log "   2. Start Nginx proxy: cd nginx && ./setup-production-https.sh"
echo
log "🌐 Your services will be available at:"
log "   • Main App: https://$DOMAIN"
log "   • API: https://api.$DOMAIN"
log "   • Auth: https://auth.$DOMAIN"
log "   • Temporal: https://temporal.$DOMAIN"
