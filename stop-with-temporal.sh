#!/bin/bash

# XiansAi Community Edition with Temporal Workflow Engine
# This script stops both the main application and Temporal services

set -e

echo "🛑 Stopping XiansAi Community Edition with Temporal Workflow Engine..."

# Stop Temporal services first
echo "⚡ Stopping Temporal services..."
docker compose -p xians-community-edition  --env-file temporal/.env.local -f temporal/docker-compose.yml down

# Stop main application services
echo "🔧 Stopping main application services..."
docker compose --env-file .env.local down

echo ""
echo "✅ All services stopped successfully!"
echo ""
echo "💡 To remove all data volumes (WARNING: This will delete all data!):"
echo "   docker compose --env-file .env.local down -v && docker compose -p xians-community-edition -f temporal/docker-compose.yml down -v"
echo "" 