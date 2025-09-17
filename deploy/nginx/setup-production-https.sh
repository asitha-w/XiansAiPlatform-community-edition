#!/bin/bash

# XiansAi Production HTTPS Setup Script
# Single command to deploy production-grade HTTPS with Let's Encrypt

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
XiansAi Production HTTPS Setup

USAGE:
    $0 [OPTIONS]

DESCRIPTION:
    Sets up production-grade HTTPS with Let's Encrypt for XiansAi Community Edition.
    Reads configuration from .env file in the nginx directory.

OPTIONS:
    -h, --help          Show this help message
    -s, --staging       Use Let's Encrypt staging environment (for testing)
    -f, --force         Force renewal of existing certificates
    -c, --check         Check current certificate status
    -d, --dry-run       Perform a dry run without making changes
    --init-certs        Initialize certificates for the first time

EXAMPLES:
    $0                  # Setup with production certificates
    $0 --staging        # Setup with staging certificates (for testing)
    $0 --check          # Check current certificate status
    $0 --init-certs     # First-time certificate setup

CONFIGURATION:
    Configuration is read from nginx/.env file. Copy nginx/.env.example to nginx/.env
    and update with your domain settings.

EOF
}

# Parse command line arguments
STAGING=false
FORCE=false
CHECK_ONLY=false
DRY_RUN=false
INIT_CERTS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--staging)
            STAGING=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -c|--check)
            CHECK_ONLY=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --init-certs)
            INIT_CERTS=true
            shift
            ;;
        *)
            error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

log "🚀 Starting XiansAi Production HTTPS Setup..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    error ".env file not found in nginx directory!"
    error "Please copy .env.example to .env and configure your domain settings."
    exit 1
fi

# Load environment variables
log "📋 Loading configuration from .env..."
set -a
source .env
set +a

# Validate required variables
if [ -z "$DOMAIN" ] || [ -z "$LETSENCRYPT_EMAIL" ]; then
    error "Required variables not set in .env file:"
    error "  DOMAIN: $DOMAIN"
    error "  LETSENCRYPT_EMAIL: $LETSENCRYPT_EMAIL"
    exit 1
fi

# Override staging setting if command line option provided
if [ "$STAGING" = true ]; then
    export STAGING=true
fi

log "📋 Configuration:"
log "   Domain: $DOMAIN"
log "   Email: $LETSENCRYPT_EMAIL"
log "   Staging: $STAGING"
log "   Network: $NETWORK_NAME"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    error "Docker is not running or not accessible"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
    error "Docker Compose is not available"
    exit 1
fi

# Use docker compose or docker-compose
DOCKER_COMPOSE="docker compose"
if ! docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
fi

# Function to check certificate status
check_certificates() {
    log "🔍 Checking certificate status..."
    
    if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
        success "Certificate found for $DOMAIN"
        
        # Check expiry
        EXPIRY=$(openssl x509 -enddate -noout -in "certbot/conf/live/$DOMAIN/fullchain.pem" | cut -d= -f2)
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$EXPIRY" +%s)
        CURRENT_EPOCH=$(date +%s)
        DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
        
        if [ $DAYS_LEFT -gt 30 ]; then
            success "Certificate is valid for $DAYS_LEFT more days"
        elif [ $DAYS_LEFT -gt 0 ]; then
            warning "Certificate expires in $DAYS_LEFT days - renewal recommended"
        else
            error "Certificate has expired!"
        fi
        
        # Show certificate details
        log "Certificate details:"
        openssl x509 -subject -issuer -dates -noout -in "certbot/conf/live/$DOMAIN/fullchain.pem" | sed 's/^/   /'
    else
        warning "No certificate found for $DOMAIN"
    fi
}

# Function to test domain connectivity
test_domain_connectivity() {
    log "🌐 Testing domain connectivity..."
    
    for subdomain in "" "api." "auth." "temporal."; do
        FULL_DOMAIN="${subdomain}${DOMAIN}"
        log "Testing $FULL_DOMAIN..."
        
        if nslookup "$FULL_DOMAIN" >/dev/null 2>&1; then
            success "✓ $FULL_DOMAIN resolves"
        else
            warning "⚠ $FULL_DOMAIN does not resolve"
        fi
    done
}

# Function to initialize certificates
init_certificates() {
    log "🔐 Initializing certificates for first-time setup..."
    
    # Create dummy certificates for nginx to start
    log "Creating temporary certificates..."
    mkdir -p "certbot/conf/live/$DOMAIN"
    
    # Generate temporary self-signed certificate
    openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
        -keyout "certbot/conf/live/$DOMAIN/privkey.pem" \
        -out "certbot/conf/live/$DOMAIN/fullchain.pem" \
        -subj "/C=US/ST=State/L=City/O=XiansAi/CN=$DOMAIN" \
        >/dev/null 2>&1
    
    # Create options-ssl-nginx.conf if it doesn't exist
    if [ ! -f "certbot/conf/options-ssl-nginx.conf" ]; then
        log "Creating SSL options file..."
        cat > "certbot/conf/options-ssl-nginx.conf" << 'EOF'
# This file contains important security parameters. If you modify this file
# manually, Certbot will be unable to automatically provide future security
# updates. Instead, Certbot will print and log an error message with a path to
# the up-to-date file that you will need to refer to when manually updating
# this file.

ssl_session_cache shared:le_nginx_SSL:10m;
ssl_session_timeout 1440m;
ssl_session_tickets off;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;

ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
EOF
    fi
    
    # Create dhparam if it doesn't exist
    if [ ! -f "certbot/conf/ssl-dhparams.pem" ]; then
        log "Generating DH parameters (this may take a while)..."
        openssl dhparam -out "certbot/conf/ssl-dhparams.pem" 2048 >/dev/null 2>&1
    fi
    
    success "Temporary certificates created"
}

# Function to start services
start_services() {
    log "🔧 Processing configuration templates..."
    $DOCKER_COMPOSE run --rm config-processor
    
    log "🚀 Starting Nginx and Certbot services..."
    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: Would start services with: $DOCKER_COMPOSE up -d"
        return 0
    fi
    
    $DOCKER_COMPOSE up -d nginx
    
    # Wait for nginx to be ready
    log "⏳ Waiting for Nginx to be ready..."
    for i in {1..30}; do
        if docker exec xiansai-nginx nginx -t >/dev/null 2>&1; then
            success "Nginx is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            error "Nginx failed to start properly"
            exit 1
        fi
        sleep 2
    done
}

# Function to obtain certificates
obtain_certificates() {
    log "🔐 Obtaining SSL certificates from Let's Encrypt..."
    
    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: Would obtain certificates for $DOMAIN"
        return 0
    fi
    
    # Start certbot service
    $DOCKER_COMPOSE up -d certbot
    
    # Wait for certificate to be obtained
    log "⏳ Waiting for certificate generation..."
    for i in {1..60}; do
        if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ] && 
           [ -f "certbot/conf/live/$DOMAIN/privkey.pem" ]; then
            success "Certificates obtained successfully!"
            break
        fi
        if [ $i -eq 60 ]; then
            error "Certificate generation timed out"
            log "Check logs with: $DOCKER_COMPOSE logs certbot"
            exit 1
        fi
        sleep 5
    done
    
    # Reload nginx with new certificates
    log "🔄 Reloading Nginx with new certificates..."
    docker exec xiansai-nginx nginx -s reload
    
    success "Nginx reloaded with SSL certificates"
}

# Function to setup firewall
setup_firewall() {
    log "🔥 Configuring firewall..."
    
    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: Would configure firewall"
        return 0
    fi
    
    # Check if ufw is available
    if command -v ufw >/dev/null 2>&1; then
        log "Configuring UFW firewall..."
        ufw --force enable
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # Block direct access to application ports
        ufw deny 3001 comment "XiansAi UI - use HTTPS proxy"
        ufw deny 5001 comment "XiansAi API - use HTTPS proxy"
        ufw deny 8080 comment "Temporal UI - use HTTPS proxy"
        ufw deny 18080 comment "Keycloak - use HTTPS proxy"
        
        success "Firewall configured"
    else
        warning "UFW not available - skipping firewall configuration"
    fi
}

# Function to show final status
show_final_status() {
    log "📊 Final Status:"
    echo
    success "🌐 Your XiansAi platform is now available at:"
    success "   • Main App: https://$DOMAIN"
    success "   • API: https://api.$DOMAIN"
    success "   • Auth: https://auth.$DOMAIN"
    success "   • Temporal: https://temporal.$DOMAIN"
    echo
    log "🔒 SSL Certificate Status:"
    check_certificates
    echo
    log "🔧 Management Commands:"
    log "   • Check status: $0 --check"
    log "   • View logs: $DOCKER_COMPOSE logs -f nginx"
    log "   • Restart: $DOCKER_COMPOSE restart nginx"
    log "   • Stop: $DOCKER_COMPOSE down"
    echo
}

# Main execution flow
main() {
    # Handle check-only mode
    if [ "$CHECK_ONLY" = true ]; then
        check_certificates
        exit 0
    fi
    
    # Test domain connectivity
    test_domain_connectivity
    
    # Initialize certificates if requested or if they don't exist
    if [ "$INIT_CERTS" = true ] || [ ! -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
        init_certificates
    fi
    
    # Start services
    start_services
    
    # Obtain certificates
    obtain_certificates
    
    # Setup firewall
    setup_firewall
    
    # Show final status
    show_final_status
}

# Run main function
main

log "✅ XiansAi Production HTTPS setup completed successfully!"
