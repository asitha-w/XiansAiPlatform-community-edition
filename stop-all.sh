#!/bin/bash

# XiansAi Community Edition with Temporal Workflow Engine
# This script stops both the main application and Temporal services

set -e

echo "🛑 Stopping XiansAi Community Edition with Temporal Workflow Engine..."

# Project name used consistently across all services
PROJECT_NAME="xians-community-edition"

# Stop Temporal services first
echo "⚡ Stopping Temporal services..."
docker compose -p $PROJECT_NAME -f temporal/docker-compose.yml down

# Stop Keycloak service
echo "🔐 Stopping Keycloak service..."
docker compose -p $PROJECT_NAME -f keycloak/docker-compose.yml down

# Stop PostgreSQL service
echo "🗄️  Stopping PostgreSQL service..."
docker compose -p $PROJECT_NAME -f postgresql/docker-compose.yml down

# Stop main application services
echo "🔧 Stopping main application services..."
docker compose -p $PROJECT_NAME down

echo ""
echo "✅ All services stopped successfully!"
echo ""
echo "💡 To remove all data volumes (WARNING: This will delete all data!):"
echo "   ./reset-all.sh"
echo "" 