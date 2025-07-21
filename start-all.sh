#!/bin/bash

# XiansAi Community Edition with Temporal Workflow Engine
# This script starts both the main application and Temporal services

set -e

# Default Configuration (can be overridden via command line)
VERSION="latest"
ENV_POSTFIX="local"
COMPOSE_PROJECT_NAME="xians-community-edition"

echo "🚀 Starting XiansAi Community Edition with Temporal and Keycloak..."

# Parse command line arguments
DETACHED=true

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -e|--env)
            ENV_POSTFIX="$2"
            shift 2
            ;;
        -d|--detached)
            DETACHED=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -v, --version VERSION    Docker image version (default: latest)"
            echo "  -e, --env ENV_POSTFIX    Environment postfix (default: local)"
            echo "  -d, --detached           Run in detached mode (default)"
            echo "  -h, --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                       # Start with defaults (latest, local)"
            echo "  $0 -v v2.0.2             # Start with specific version"
            echo "  $0 -e production         # Start with production environment"
            echo "  $0 -v v2.0.2 -e staging # Start with version v2.0.2 and staging env"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Set final configuration based on arguments
export COMPOSE_PROJECT_NAME="$COMPOSE_PROJECT_NAME"
export SERVER_IMAGE="99xio/xiansai-server:$VERSION"
export UI_IMAGE="99xio/xiansai-ui:$VERSION"
export ENV_POSTFIX="$ENV_POSTFIX"

echo "📋 Configuration:"
echo "   Project: $COMPOSE_PROJECT_NAME"
echo "   Server Image: $SERVER_IMAGE"
echo "   UI Image: $UI_IMAGE"
echo "   Environment: $ENV_POSTFIX"
echo ""

# Start the main application services first
echo "🔧 Starting main application services..."
if [ "$DETACHED" = true ]; then
    docker compose up -d
else
    docker compose up
fi

# Wait a moment for the network to be created
sleep 2

# Start PostgreSQL service first
echo "🗄️  Starting PostgreSQL service..."
# Set environment variables
export POSTGRESQL_VERSION=16
docker compose -p $COMPOSE_PROJECT_NAME -f postgresql/docker-compose.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 15

# Initialize Keycloak database
echo "🔧 Initializing Keycloak database..."
if [ -f "keycloak/init-keycloak-db.sh" ]; then
    if ./keycloak/init-keycloak-db.sh; then
        echo "✅ Keycloak database initialization completed successfully"
    else
        echo "⚠️  Keycloak database initialization encountered issues, but continuing..."
        echo "   (Keycloak may still work if database already exists)"
    fi
else
    echo "⚠️  keycloak/init-keycloak-db.sh not found, skipping manual initialization"
    echo "   (Relying on PostgreSQL init script)"
fi

# Start Keycloak service
echo "🔐 Starting Keycloak service..."
docker compose -p $COMPOSE_PROJECT_NAME -f keycloak/docker-compose.yml --env-file keycloak/.env.local up -d

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to initialize..."
sleep 20

# Start Temporal services with environment configuration
echo "⚡ Starting Temporal services..."
docker compose -p $COMPOSE_PROJECT_NAME -f temporal/docker-compose.yml --env-file temporal/.env.local up -d

# Setup Temporal search attributes
echo "🔧 Setting up Temporal search attributes..."
./temporal/setup-search-attributes.sh

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📊 Access Points:"
echo "  • XiansAi UI:    http://localhost:3001"
echo "  • XiansAi Server API:   http://localhost:5001/api-docs"
echo "  • Keycloak Admin Console: http://localhost:18080/admin"
echo "  • Temporal Web UI:        http://localhost:8080"
echo "  • Temporal gRPC API:      localhost:7233"
echo "  • MongoDB:                localhost:27017"
echo "  • Temporal PostgreSQL:    localhost:5432"
echo ""
echo "�� Useful commands:"
echo "  • View logs:              docker compose logs -f [service-name]"
echo "  • Stop all:               ./stop-all.sh"
echo "" 