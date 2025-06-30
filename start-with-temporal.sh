#!/bin/bash

# XiansAi Community Edition with Temporal Workflow Engine
# This script starts both the main application and Temporal services

set -e

echo "🚀 Starting XiansAi Community Edition with Temporal Workflow Engine..."

# Load environment variables
if [ -f ".env.local" ]; then
    echo "📁 Loading environment from .env.local"
    # Export variables one by one, skipping comments and problematic lines
    while IFS= read -r line; do
        if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*=[^[].*$ ]]; then
            export "$line"
        fi
    done < <(grep -v '^#' .env.local | grep -v '^\s*$')
fi

# Start the main application services first
echo "🔧 Starting main application services..."
docker compose --env-file .env.local up -d

# Wait a moment for the network to be created
sleep 2

# Start PostgreSQL service first
echo "🗄️  Starting PostgreSQL service..."
# Set environment variables
export POSTGRESQL_VERSION=16
export ENVIRONMENT_SUFFIX=""
docker compose -p xians-community-edition -f postgresql/docker-compose.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Start Temporal services with environment configuration
echo "⚡ Starting Temporal services..."
# Set environment variables for Temporal versions
export TEMPORAL_VERSION=1.28.0
export TEMPORAL_UI_VERSION=2.34.0
export TEMPORAL_ADMINTOOLS_VERSION=1.28.0-tctl-1.18.2-cli-1.3.0
docker compose -p xians-community-edition -f temporal/docker-compose.yml up -d

# Setup Temporal search attributes
echo "🔧 Setting up Temporal search attributes..."
./temporal/setup-search-attributes.sh

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📊 Access Points:"
echo "  • Your Application UI:    http://localhost:3001"
echo "  • Your Application API:   http://localhost:5001"
echo "  • Temporal Web UI:        http://localhost:8080"
echo "  • Temporal gRPC API:      localhost:7233"
echo "  • MongoDB:                localhost:27017"
echo "  • Temporal PostgreSQL:    localhost:5432"
echo ""
echo "🔧 Useful commands:"
echo "  • Check status:           docker compose --env-file .env.local ps && docker compose -p xians-community-edition -f postgresql/docker-compose.yml ps && docker compose -p xians-community-edition -f temporal/docker-compose.yml ps"
echo "  • View logs:              docker compose logs -f [service-name]"
echo "  • Temporal CLI alias:     alias tctl=\"docker exec temporal-admin-tools tctl\""
echo "  • Verify search attrs:    ./temporal/verify-search-attributes.sh"
echo "  • Setup search attrs:     ./temporal/setup-search-attributes.sh"
echo "  • Stop all:               ./stop-with-temporal.sh"
echo "" 