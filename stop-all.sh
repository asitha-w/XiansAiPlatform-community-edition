#!/bin/bash

# XiansAi Community Edition with Temporal Workflow Engine
# This script stops both the main application and Temporal services

set -e

echo "🛑 Stopping XiansAi Community Edition with Temporal Workflow Engine..."

# Load environment variables from temporal/.env.local
if [ -f "temporal/.env.local" ]; then
    echo "📁 Loading environment from temporal/.env.local"
    # Export variables one by one, skipping comments and empty lines
    while IFS= read -r line; do
        if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*=.*$ ]]; then
            export "$line"
        fi
    done < <(grep -v '^#' temporal/.env.local | grep -v '^\s*$')
fi

# Set default environment suffix if not already set
export ENVIRONMENT_SUFFIX="${ENVIRONMENT_SUFFIX:-}"

# Stop Temporal services first
echo "⚡ Stopping Temporal services..."
docker compose -p xians-community-edition -f temporal/docker-compose.yml down

# Stop Keycloak service
echo "🔐 Stopping Keycloak service..."
docker compose -p xians-community-edition -f keycloak/docker-compose.yml down

# Stop PostgreSQL service
echo "🗄️  Stopping PostgreSQL service..."
docker compose -p xians-community-edition -f postgresql/docker-compose.yml down

# Stop main application services
echo "🔧 Stopping main application services..."
unset COMPOSE_PROJECT_NAME
docker compose --env-file .env.local down

echo ""
echo "✅ All services stopped successfully!"
echo ""
echo "💡 To remove all data volumes (WARNING: This will delete all data!):"
echo "   ./reset-all.sh"
echo "" 