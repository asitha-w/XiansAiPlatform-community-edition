#!/bin/bash
# Generate TLS certificates for Temporal server mTLS
# Based on temporalio/samples-server tls-simple example

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="${SCRIPT_DIR}/certs"

echo "🔐 Generating TLS certificates for Temporal mTLS..."

# Create certs directory if it doesn't exist
mkdir -p "${CERTS_DIR}"
cd "${CERTS_DIR}"

# Generate CA private key
echo "Generating CA private key..."
openssl genrsa -out ca.key 4096

# Generate CA certificate
echo "Generating CA certificate..."
openssl req -new -x509 -key ca.key -sha256 -subj "/C=US/ST=CA/O=XiansAI/CN=XiansAI-CA" -days 3650 -out ca.crt

# Generate server private key
echo "Generating server private key..."
openssl genrsa -out server.key 4096

# Generate server certificate signing request
echo "Generating server certificate signing request..."
openssl req -new -key server.key -out server.csr -config <(
cat <<EOF
[req]
default_bits = 4096
prompt = no
distinguished_name = req_distinguished_name
req_extensions = req_ext

[req_distinguished_name]
C = US
ST = CA
O = XiansAI
CN = temporal

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = temporal
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF
)

# Generate server certificate
echo "Generating server certificate..."
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365 -sha256 -extensions req_ext -extfile <(
cat <<EOF
[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = temporal
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF
)

# Generate client private key
echo "Generating client private key..."
openssl genrsa -out client.key 4096

# Generate client certificate signing request
echo "Generating client certificate signing request..."
openssl req -new -key client.key -out client.csr -subj "/C=US/ST=CA/O=XiansAI/CN=client"

# Generate client certificate
echo "Generating client certificate..."
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt -days 365 -sha256

# Clean up CSR files
rm server.csr client.csr

# Set appropriate permissions
chmod 600 *.key
chmod 644 *.crt

echo "✅ TLS certificates generated successfully in ${CERTS_DIR}"
echo ""
echo "Generated files:"
echo "  - ca.crt (Certificate Authority)"
echo "  - ca.key (CA private key)"
echo "  - server.crt (Temporal server certificate)"
echo "  - server.key (Temporal server private key)"
echo "  - client.crt (Client certificate)"
echo "  - client.key (Client private key)"
echo ""
echo "To use these certificates:"
echo "1. Update temporal/.env.local with TLS settings"
echo "2. Restart Temporal services: docker compose -f temporal/docker-compose.yml restart"
echo "3. Configure client applications with client.crt and client.key"
