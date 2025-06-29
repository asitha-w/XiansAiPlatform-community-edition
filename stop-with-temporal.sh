#!/bin/bash

# XiansAi Community Edition with Temporal Workflow Engine
# This script stops both the main application and Temporal services

set -e

echo "🛑 Stopping XiansAi Community Edition with Temporal Workflow Engine..."

# Stop Temporal services first
echo "⚡ Stopping Temporal services..."
# Set environment variables for Temporal versions
export POSTGRESQL_VERSION=16
export TEMPORAL_VERSION=1.28.0
export TEMPORAL_UI_VERSION=2.34.0
export TEMPORAL_ADMINTOOLS_VERSION=1.28.0-tctl-1.18.2-cli-1.3.0
export ENVIRONMENT_SUFFIX=""
docker compose -p xians-community-edition -f temporal/docker-compose.yml down

# Stop main application services
echo "🔧 Stopping main application services..."
docker compose --env-file .env.local down

echo ""
echo "✅ All services stopped successfully!"
echo ""
echo "💡 To remove all data volumes (WARNING: This will delete all data!):"
echo "   docker compose --env-file .env.local down -v && docker compose -p xians-community-edition -f temporal/docker-compose.yml down -v"
echo "" 