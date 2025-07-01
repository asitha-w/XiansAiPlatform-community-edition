#!/bin/bash

# Keycloak Database Initialization Script
# Alternative approach: Run this script manually if needed

set -e

echo "🔧 Initializing Keycloak database..."

# Configuration
POSTGRES_HOST=${POSTGRES_HOST:-postgresql}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_USER=${POSTGRES_USER:-temporal}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres-password}
KC_DB_NAME=${KC_DB_NAME:-keycloak}
KC_DB_USER=${KC_DB_USER:-keycloak}
KC_DB_PASSWORD=${KC_DB_PASSWORD:-temporal}

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec postgresql pg_isready -h localhost -p 5432 -U "$POSTGRES_USER" > /dev/null 2>&1; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 2
done
echo "✅ PostgreSQL is ready!"

# Create Keycloak database if it doesn't exist
echo "🗄️  Creating Keycloak database if it doesn't exist..."
docker exec postgresql psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$KC_DB_NAME'" | grep -q 1 || \
docker exec postgresql psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $KC_DB_NAME"

# Create Keycloak user if it doesn't exist
echo "👤 Creating Keycloak user if it doesn't exist..."
docker exec postgresql psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = '$KC_DB_USER'" | grep -q 1 || \
docker exec postgresql psql -U "$POSTGRES_USER" -d postgres -c "CREATE USER $KC_DB_USER WITH PASSWORD '$KC_DB_PASSWORD'"

# Grant privileges
echo "🔐 Granting privileges..."
docker exec postgresql psql -U "$POSTGRES_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $KC_DB_NAME TO $KC_DB_USER"

echo "✅ Keycloak database initialization complete!" 