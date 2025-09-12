#!/bin/bash
# Configure Temporal client with mTLS certificates
# This script updates server/.env.local with base64-encoded certificates

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="${SCRIPT_DIR}/certs"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SERVER_ENV_FILE="${PROJECT_ROOT}/server/.env.local"

echo "🔐 Configuring Temporal client with mTLS certificates..."

# Check if certificates exist
if [[ ! -f "${CERTS_DIR}/client.crt" || ! -f "${CERTS_DIR}/client.key" ]]; then
    echo "❌ Client certificates not found in ${CERTS_DIR}"
    echo "Please run ./tls/generate-certs.sh first to generate certificates."
    exit 1
fi

# Check if server env file exists
if [[ ! -f "${SERVER_ENV_FILE}" ]]; then
    echo "❌ Server environment file not found: ${SERVER_ENV_FILE}"
    exit 1
fi

echo "📜 Encoding certificates..."

# Base64 encode certificates (handle both GNU and BSD base64)
if base64 --help 2>&1 | grep -q "wrap"; then
    # GNU base64 (Linux)
    CERT_B64=$(base64 -w 0 "${CERTS_DIR}/client.crt")
    KEY_B64=$(base64 -w 0 "${CERTS_DIR}/client.key")
else
    # BSD base64 (macOS)
    CERT_B64=$(base64 -i "${CERTS_DIR}/client.crt")
    KEY_B64=$(base64 -i "${CERTS_DIR}/client.key")
fi

echo "📝 Updating server/.env.local..."

# Create backup
cp "${SERVER_ENV_FILE}" "${SERVER_ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created: ${SERVER_ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Update the environment file
# Check if certificate lines already exist
if grep -q "^Temporal__CertificateBase64=" "${SERVER_ENV_FILE}"; then
    echo "📝 Updating existing certificate configuration..."
    # Update existing lines
    sed -i.tmp "s|^Temporal__CertificateBase64=.*|Temporal__CertificateBase64=${CERT_B64}|" "${SERVER_ENV_FILE}"
    sed -i.tmp "s|^Temporal__PrivateKeyBase64=.*|Temporal__PrivateKeyBase64=${KEY_B64}|" "${SERVER_ENV_FILE}"
    rm "${SERVER_ENV_FILE}.tmp"
else
    echo "📝 Adding new certificate configuration..."
    # Add new lines after the namespace line
    sed -i.tmp "/^Temporal__FlowServerNamespace=/a\\
Temporal__CertificateBase64=${CERT_B64}\\
Temporal__PrivateKeyBase64=${KEY_B64}" "${SERVER_ENV_FILE}"
    rm "${SERVER_ENV_FILE}.tmp"
fi

echo "✅ Successfully updated server/.env.local with client certificates"
echo ""
echo "📋 Configuration Summary:"
echo "   - Client certificate: $(echo $CERT_B64 | cut -c1-20)..."
echo "   - Private key: $(echo $KEY_B64 | cut -c1-20)..."
echo ""
echo "🔄 Next steps:"
echo "   1. Restart the server: docker compose restart xiansai-server"
echo "   2. Check logs: docker logs xians-server"
echo "   3. Verify connection to TLS-enabled Temporal server"
echo ""
echo "💡 To revert changes, restore from backup:"
echo "   cp ${SERVER_ENV_FILE}.backup.* ${SERVER_ENV_FILE}"
