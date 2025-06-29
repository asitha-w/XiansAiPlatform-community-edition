#!/bin/bash

# XiansAi Platform Startup Script
# This script helps you get started with the XiansAi platform quickly

set -e

echo "🚀 XiansAi Platform Startup Script"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Parse command line arguments
ENVIRONMENT="local"
DETACHED=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--detached)
            DETACHED=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -e, --env, --environment  Specify environment name (default: local)"
            echo "  -d, --detached           Run in detached mode"
            echo "  -h, --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                       # Run with default local environment"
            echo "  $0 -e production         # Run with production environment"
            echo "  $0 -e staging -d         # Run with staging environment in detached mode"
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

# Check if environment files exist (optional check for server and ui)
if [ -d "server" ] && [ ! -f "server/.env.$ENVIRONMENT" ]; then
    echo "⚠️  server/.env.$ENVIRONMENT file not found."
    echo "   This may be required depending on your configuration."
fi

if [ -d "ui" ] && [ ! -f "ui/.env.$ENVIRONMENT" ]; then
    echo "⚠️  ui/.env.$ENVIRONMENT file not found."
    echo "   This may be required depending on your configuration."
fi

# Set the environment configuration
echo "📋 Using environment: $ENVIRONMENT"
echo "📋 Environment file: $ENV_FILE"

echo "🔧 Starting in $ENVIRONMENT mode..."

# Pull latest images
echo "📦 Pulling latest Docker images..."
docker compose --env-file "$ENV_FILE" pull

# Start the services
if [ "$DETACHED" = true ]; then
    echo "🚀 Starting XiansAi platform in detached mode..."
    docker compose --env-file "$ENV_FILE" up -d
    echo ""
    echo "✅ XiansAi platform started successfully!"
    echo "📱 Access the applications:"
    echo "   - XiansAi UI: http://localhost:3001"
    echo "   - XiansAi Server API: http://localhost:5001"
    echo ""
    echo "📋 Manage the platform:"
    echo "   - View logs: docker compose --env-file $ENV_FILE logs -f"
    echo "   - Stop services: docker compose --env-file $ENV_FILE down"
    echo "   - Check status: docker compose --env-file $ENV_FILE ps"
else
    echo "🚀 Starting XiansAi platform..."
    echo "   Press Ctrl+C to stop"
    echo ""
    docker compose --env-file "$ENV_FILE" up
fi 