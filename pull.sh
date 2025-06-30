#!/bin/bash

# XiansAi Platform Image Pull Script
# This script helps you pull the latest server and UI images

set -e

echo "📦 XiansAi Platform Image Pull Script"
echo "====================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Parse command line arguments
ENVIRONMENT="local"
PULL_ALL=false
PULL_SERVER=false
PULL_UI=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--all)
            PULL_ALL=true
            shift
            ;;
        -s|--server)
            PULL_SERVER=true
            shift
            ;;
        -u|--ui)
            PULL_UI=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -e, --env, --environment  Specify environment name (default: local)"
            echo "  -a, --all                Pull all images (server, ui, and dependencies)"
            echo "  -s, --server             Pull only server image"
            echo "  -u, --ui                 Pull only UI image"
            echo "  -h, --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                       # Pull latest server and UI images"
            echo "  $0 -e production         # Pull with production environment"
            echo "  $0 -s                    # Pull only server image"
            echo "  $0 -u                    # Pull only UI image"
            echo "  $0 -a                    # Pull all images including dependencies"
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

# Load environment variables to get image names
source "$ENV_FILE"

# Set default image names if not specified in environment
SERVER_IMAGE=${SERVER_IMAGE:-99xio/xiansai-server:latest}
UI_IMAGE=${UI_IMAGE:-99xio/xiansai-ui:latest}

# Determine what to pull
if [ "$PULL_ALL" = true ]; then
    echo "📦 Pulling all Docker images..."
    docker compose --env-file "$ENV_FILE" pull
elif [ "$PULL_SERVER" = true ] && [ "$PULL_UI" = true ]; then
    echo "📦 Pulling server and UI images..."
    docker pull "$SERVER_IMAGE"
    docker pull "$UI_IMAGE"
elif [ "$PULL_SERVER" = true ]; then
    echo "📦 Pulling server image: $SERVER_IMAGE"
    docker pull "$SERVER_IMAGE"
elif [ "$PULL_UI" = true ]; then
    echo "📦 Pulling UI image: $UI_IMAGE"
    docker pull "$UI_IMAGE"
else
    # Default behavior: pull server and UI images
    echo "📦 Pulling server and UI images..."
    echo "   Server image: $SERVER_IMAGE"
    echo "   UI image: $UI_IMAGE"
    docker pull "$SERVER_IMAGE"
    docker pull "$UI_IMAGE"
fi

echo ""
echo "✅ Image pull completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   - Start platform: ./start.sh -e $ENVIRONMENT"
echo "   - View current images: docker images | grep -E '(xiansai|99xio)'"
echo "   - Check image info: docker inspect $SERVER_IMAGE" 