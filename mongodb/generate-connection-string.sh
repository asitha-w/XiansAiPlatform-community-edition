#!/bin/bash

# MongoDB Connection String Generator
# This script generates MongoDB connection strings using credentials from .env.local

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.local"

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ ERROR: MongoDB .env.local file not found at $ENV_FILE"
    echo "Please run create-secrets.sh first to generate MongoDB credentials."
    exit 1
fi

# Source the environment file
source "$ENV_FILE"

# Validate required variables
if [ -z "$MONGO_APP_USERNAME" ] || [ -z "$MONGO_APP_PASSWORD" ] || [ -z "$MONGO_DB_NAME" ]; then
    echo "❌ ERROR: Missing required MongoDB credentials in $ENV_FILE"
    echo "Required variables: MONGO_APP_USERNAME, MONGO_APP_PASSWORD, MONGO_DB_NAME"
    exit 1
fi

# Generate connection string
CONNECTION_STRING="mongodb://${MONGO_APP_USERNAME}:${MONGO_APP_PASSWORD}@mongodb:27017/${MONGO_DB_NAME}?replicaSet=rs0&retryWrites=true&w=majority&authSource=${MONGO_DB_NAME}"

# Output based on argument
case "${1:-connection}" in
    "connection")
        echo "$CONNECTION_STRING"
        ;;
    "admin-connection")
        if [ -z "$MONGO_INITDB_ROOT_USERNAME" ] || [ -z "$MONGO_INITDB_ROOT_PASSWORD" ]; then
            echo "❌ ERROR: Missing admin credentials in $ENV_FILE"
            exit 1
        fi
        echo "mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongodb:27017/admin?replicaSet=rs0&retryWrites=true&w=majority&authSource=admin"
        ;;
    "help")
        echo "MongoDB Connection String Generator"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  connection       Generate application connection string (default)"
        echo "  admin-connection Generate admin connection string"
        echo "  help            Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                    # Application connection string"
        echo "  $0 connection         # Application connection string"
        echo "  $0 admin-connection   # Admin connection string"
        ;;
    *)
        echo "❌ ERROR: Unknown option '$1'"
        echo "Use '$0 help' for usage information."
        exit 1
        ;;
esac
