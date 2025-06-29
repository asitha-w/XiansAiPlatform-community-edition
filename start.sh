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

# Check if environment files exist
if [ ! -f "server/.env.development" ]; then
    echo "❌ server/.env.development file not found. This file is required."
    echo "   Please ensure the server environment file exists."
    exit 1
fi

if [ ! -f "ui/.env.development" ]; then
    echo "❌ ui/.env.development file not found. This file is required."
    echo "   Please ensure the UI environment file exists."
    exit 1
fi

# Parse command line arguments
ENVIRONMENT="development"
DETACHED=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--prod|--production)
            ENVIRONMENT="production"
            shift
            ;;
        -d|--detached)
            DETACHED=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -p, --prod, --production  Run in production mode"
            echo "  -d, --detached           Run in detached mode"
            echo "  -h, --help               Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Determine which docker-compose file to use
if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "🏭 Starting in PRODUCTION mode..."
    if [ ! -f "server/.env.production" ] || [ ! -f "ui/.env.production" ]; then
        echo "❌ Production environment files not found."
        echo "   Required files: server/.env.production, ui/.env.production"
        echo "   You can copy from development files and customize:"
        echo "   cp server/.env.development server/.env.production"
        echo "   cp ui/.env.development ui/.env.production"
        exit 1
    fi
else
    COMPOSE_FILE="docker-compose.yml"
    echo "🛠️  Starting in DEVELOPMENT mode..."
fi

# Pull latest images
echo "📦 Pulling latest Docker images..."
docker compose -p xians-community-edition -f "$COMPOSE_FILE" pull

# Start the services
if [ "$DETACHED" = true ]; then
    echo "🚀 Starting XiansAi platform in detached mode..."
    docker compose -p xians-community-edition -f "$COMPOSE_FILE" up -d
    echo ""
    echo "✅ XiansAi platform started successfully!"
    echo "📱 Access the applications:"
    echo "   - XiansAi UI: http://localhost:3001"
    echo "   - XiansAi Server API: http://localhost:5001"
    echo ""
    echo "📋 Manage the platform:"
    echo "   - View logs: docker compose -p xians-community-edition -f $COMPOSE_FILE logs -f"
    echo "   - Stop services: docker compose -p xians-community-edition -f $COMPOSE_FILE down"
    echo "   - Check status: docker compose -p xians-community-edition -f $COMPOSE_FILE ps"
else
    echo "🚀 Starting XiansAi platform..."
    echo "   Press Ctrl+C to stop"
    echo ""
    docker compose -p xians-community-edition -f "$COMPOSE_FILE" up
fi 