#!/bin/bash

# XiansAi Community Edition with Temporal Workflow Engine
# This script stops both the main application and Temporal services

set -e

# Project configuration
COMPOSE_PROJECT_NAME="xians-community-edition"

echo "🛑 Stopping XiansAi Community Edition with Temporal Workflow Engine..."

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -h, --help               Show this help message"
            echo ""
            echo "This script stops all XiansAi services regardless of version or environment."
            echo ""
            echo "Examples:"
            echo "  $0                       # Stop all XiansAi services"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Stop Temporal services first
echo "⚡ Stopping Temporal services..."
docker compose -p $COMPOSE_PROJECT_NAME -f temporal/docker-compose.yml down

# Stop Keycloak service
echo "🔐 Stopping Keycloak service..."
docker compose -p $COMPOSE_PROJECT_NAME -f keycloak/docker-compose.yml down

# Stop PostgreSQL service
echo "🗄️  Stopping PostgreSQL service..."
docker compose -p $COMPOSE_PROJECT_NAME -f postgresql/docker-compose.yml down

# Stop main application services
echo "🔧 Stopping main application services..."
docker compose -p $COMPOSE_PROJECT_NAME down

echo ""
echo "✅ All services stopped successfully!"
echo ""
echo "💡 To remove all data volumes (WARNING: This will delete all data!):"
echo "   ./reset-all.sh"
echo "" 