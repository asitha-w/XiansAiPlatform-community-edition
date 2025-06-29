#!/bin/bash

# XiansAi Platform Stop Script
# This script helps you stop the XiansAi platform services

set -e

echo "🛑 XiansAi Platform Stop Script"
echo "==============================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Parse command line arguments
ENVIRONMENT="local"
REMOVE_VOLUMES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -v|--volumes)
            REMOVE_VOLUMES=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -e, --env, --environment  Specify environment name (default: local)"
            echo "  -v, --volumes            Also remove volumes (data will be lost)"
            echo "  -h, --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                       # Stop with default local environment"
            echo "  $0 -e production         # Stop with production environment"
            echo "  $0 -e staging -v         # Stop with staging environment and remove volumes"
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

# Stop the services
if [ "$REMOVE_VOLUMES" = true ]; then
    echo "🛑 Stopping XiansAi platform and removing volumes..."
    echo "⚠️  WARNING: This will permanently delete all data!"
    docker compose --env-file "$ENV_FILE" down -v
    echo "🗑️  Volumes removed"
else
    echo "🛑 Stopping XiansAi platform..."
    docker compose --env-file "$ENV_FILE" down
fi

echo ""
echo "✅ XiansAi platform stopped successfully!"
echo ""
echo "📋 Next steps:"
echo "   - Start again: ./start.sh -e $ENVIRONMENT"
if [ "$REMOVE_VOLUMES" = false ]; then
    echo "   - Remove volumes: ./stop.sh -e $ENVIRONMENT -v"
fi
echo "   - Complete reset: ./reset.sh -e $ENVIRONMENT" 