#!/bin/bash

# Fix for stuck setup - kills the hanging config processor and restarts properly

set -e

echo "🔧 Fixing stuck HTTPS setup..."

# Kill any hanging containers
echo "Stopping any running containers..."
docker compose down 2>/dev/null || true

# Clean up any stuck containers
echo "Cleaning up containers..."
docker container prune -f 2>/dev/null || true

# Process the template manually (safer approach)
echo "Processing nginx configuration template..."

# Load environment variables
if [ -f ".env" ]; then
    source .env
fi

# Create the actual nginx config by replacing variables
envsubst '${DOMAIN} ${UI_PORT} ${SERVER_PORT} ${KEYCLOAK_PORT} ${TEMPORAL_PORT} ${CLIENT_MAX_BODY_SIZE}' \
  < conf.d/xiansai.conf.template \
  > conf.d/xiansai.conf

echo "✅ Configuration processed successfully!"

# Show first few lines to verify
echo "Generated configuration preview:"
head -20 conf.d/xiansai.conf

echo ""
echo "🚀 Now restart the setup:"
echo "   ./setup-production-https.sh --init-certs"
