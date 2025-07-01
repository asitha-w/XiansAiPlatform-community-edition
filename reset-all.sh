#!/bin/bash

# XiansAi Platform Reset Script
# This script completely resets the XiansAi platform (DESTRUCTIVE)

set -e

echo "💥 XiansAi Platform Reset Script"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Parse command line arguments
ENVIRONMENT="local"
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -e, --env, --environment  Specify environment name (default: local)"
            echo "  -f, --force              Skip confirmation prompts"
            echo "  -h, --help               Show this help message"
            echo ""
            echo "⚠️  WARNING: This script will:"
            echo "     - Stop all XiansAi services"
            echo "     - Remove all volumes (DELETE ALL DATA)"
            echo "     - Remove XiansAi Docker images"
            echo "     - Clean up Docker system"
            echo ""
            echo "Examples:"
            echo "  $0                       # Reset with default local environment"
            echo "  $0 -e production         # Reset with production environment"
            echo "  $0 -e staging -f         # Reset with staging environment (no prompts)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Check if environment-specific .env file exists
ENV_FILE=".env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE file not found. This file is required."
    echo "   This file controls the Docker Compose configuration."
    echo "   Available environment files:"
    ls -1 .env.* 2>/dev/null | sed 's/^/     /' || echo "     No .env.* files found"
    exit 1
fi

# Set the environment configuration
echo "📋 Using environment: $ENVIRONMENT"
echo "📋 Environment file: $ENV_FILE"

# Confirmation prompt (unless forced)
if [ "$FORCE" = false ]; then
    echo ""
    echo "⚠️  WARNING: This will completely reset the XiansAi platform!"
    echo "    This action will:"
    echo "    • Stop all running services"
    echo "    • DELETE ALL DATA (volumes will be removed)"
    echo "    • Remove XiansAi Docker images"
    echo "    • Clean up Docker system"
    echo ""
    read -p "Are you sure you want to continue? Type 'RESET' to confirm: " confirmation
    
    if [ "$confirmation" != "RESET" ]; then
        echo "❌ Reset cancelled."
        exit 1
    fi
fi

echo ""
echo "💥 Starting complete reset..."

# Step 1: Stop and remove containers and volumes
echo "🛑 Stopping services and removing volumes..."

# Stop main application services
echo "   • Stopping main application services..."
docker compose --env-file "$ENV_FILE" down -v --remove-orphans

# Stop Temporal services (if running)
echo "   • Stopping Temporal services..."
docker compose -p xians-community-edition -f temporal/docker-compose.yml down -v --remove-orphans 2>/dev/null || echo "     (Temporal services not running)"

# Stop Keycloak services (if running)
echo "   • Stopping Keycloak services..."
docker compose -p xians-community-edition -f keycloak/docker-compose.yml down -v --remove-orphans 2>/dev/null || echo "     (Keycloak services not running)"

# Stop PostgreSQL services (if running)
echo "   • Stopping PostgreSQL services..."
docker compose -p xians-community-edition -f postgresql/docker-compose.yml down -v --remove-orphans 2>/dev/null || echo "     (PostgreSQL services not running)"

# Step 2: Remove XiansAi Docker images
# echo "🗑️  Removing XiansAi Docker images..."
# docker images --format "table {{.Repository}}:{{.Tag}}" | grep -E "(xiansai|99xio)" | while read image; do
#     if [ "$image" != "REPOSITORY:TAG" ]; then
#         echo "   Removing: $image"
#         docker rmi "$image" 2>/dev/null || echo "   (Image not found or in use: $image)"
#     fi
# done

# Step 3: Clean up Docker system
echo "🧹 Cleaning up Docker system..."
docker system prune -f

# Step 4: Remove any remaining volumes
echo "🗑️  Removing any remaining XiansAi volumes..."
docker volume ls --format "table {{.Name}}" | grep -E "(xians|xiansai|community-edition|temporal|keycloak|postgres)" | while read volume; do
    if [ "$volume" != "VOLUME" ]; then
        echo "   Removing volume: $volume"
        docker volume rm "$volume" 2>/dev/null || echo "   (Volume not found: $volume)"
    fi
done

# Step 5: Remove anonymous volumes (created by containers but not used)
echo "🗑️  Removing unused anonymous volumes..."
docker volume ls -q --filter "dangling=true" | while read volume; do
    if [ -n "$volume" ]; then
        echo "   Removing anonymous volume: $volume"
        docker volume rm "$volume" 2>/dev/null || echo "   (Volume in use: $volume)"
    fi
done

echo ""
echo "✅ XiansAi platform reset completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   - Start fresh: ./start.sh -e $ENVIRONMENT"
echo "   - Configure: Edit .env.$ENVIRONMENT and related files"
echo ""
echo "ℹ️  Note: You may need to reconfigure your environment files"
echo "   if this was your first time running the platform." 