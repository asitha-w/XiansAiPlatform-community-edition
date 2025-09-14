#!/bin/bash

# XiansAi Community Edition - Secret Recreation Script
# This script generates secure passwords and secrets for all services
# Called by start-all.sh to ensure secure defaults

set -e

echo "🔐 Recreating secrets for XiansAi Community Edition..."

# Function to generate secure random password
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $((length * 3 / 4)) | tr -d "=+/" | cut -c1-${length}
}

# Function to generate base64 encoded secret
generate_base64_secret() {
    local length=${1:-64}
    openssl rand -base64 ${length} | tr -d '\n'
}

# Function to generate alphanumeric password
generate_alphanumeric() {
    local length=${1:-32}
    LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c${length}
}

# Function to generate SSL certificate and return base64 encoded PFX
generate_ssl_certificate() {
    local password="$1"
    local ca_name="XiansAi Server"
    local days=3650
    local key_size=4096
    
    # Create temporary directory for certificate generation
    local temp_dir=$(mktemp -d)
    
    # Generate private key
    openssl genrsa -des3 -passout pass:"$password" -out "$temp_dir/$ca_name.key" $key_size 2>/dev/null
    
    # Generate self-signed certificate
    openssl req -x509 -new -nodes -key "$temp_dir/$ca_name.key" -sha256 -days $days \
        -passin pass:"$password" \
        -out "$temp_dir/$ca_name.crt" \
        -subj "/C=US/ST=State/L=City/O=XiansAi/OU=IT/CN=$ca_name" \
        -set_serial $(date -u +%s) 2>/dev/null
    
    # Create PFX file (PKCS#12) containing both certificate and private key
    openssl pkcs12 -export -out "$temp_dir/$ca_name.pfx" -inkey "$temp_dir/$ca_name.key" \
        -in "$temp_dir/$ca_name.crt" -passin pass:"$password" -passout pass:"$password" 2>/dev/null
    
    # Base64 encode the PFX file and remove newlines
    local base64_cert=$(cat "$temp_dir/$ca_name.pfx" | base64 | tr -d '\n')
    
    # Clean up temporary files
    rm -rf "$temp_dir"
    
    echo "$base64_cert"
}

# Function to update env file with generated secret
update_env_file() {
    local file="$1"
    local key="$2"
    local value="$3"
    
    if [ -f "$file" ]; then
        # Create a temporary file
        local temp_file=$(mktemp)
        
        # Process the file line by line
        while IFS= read -r line; do
            if [[ $line =~ ^${key}= ]]; then
                # Replace the line with the key
                echo "${key}=${value}" >> "$temp_file"
            else
                # Keep the original line
                echo "$line" >> "$temp_file"
            fi
        done < "$file"
        
        # Check if key was found and replaced
        if ! grep -q "^${key}=" "$temp_file"; then
            # Key wasn't found, append it
            echo "${key}=${value}" >> "$temp_file"
        fi
        
        # Replace the original file
        mv "$temp_file" "$file"
    else
        echo "⚠️  Warning: $file not found, skipping..."
    fi
}

# Generate shared database credentials (used by both Temporal and Keycloak)
echo "🗄️  Generating database credentials..."
POSTGRES_USER="temporal"
POSTGRES_PASSWORD=$(generate_alphanumeric 32)

# Load values from root .env file (REQUIRED)
echo "📖 Reading configuration from root .env file..."
# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Root .env file is in the parent directory of the script
ROOT_ENV_FILE="$(dirname "$SCRIPT_DIR")/.env"

# Check if root .env file exists
if [ ! -f "$ROOT_ENV_FILE" ]; then
    echo "❌ ERROR: Root .env file not found at $ROOT_ENV_FILE"
    echo ""
    echo "The root .env file is required and must contain:"
    echo "  • OPENAI_API_KEY=your_openai_api_key"
    echo "  • KEYCLOAK_ADMIN_PASSWORD=your_admin_password"
    echo ""
    echo "Please create the .env file in the project root directory."
    echo "You can copy .env.example as a starting point."
    exit 1
fi

echo "   Found root .env file, reading required values..."

# Read OPENAI_API_KEY from root .env
OPENAI_API_KEY=$(grep "^OPENAI_API_KEY=" "$ROOT_ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
# Read KEYCLOAK_ADMIN_PASSWORD from root .env
KEYCLOAK_ADMIN_PASSWORD=$(grep "^KEYCLOAK_ADMIN_PASSWORD=" "$ROOT_ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")

# Validate that required values are present and not empty
MISSING_VALUES=""

if [ -z "$OPENAI_API_KEY" ]; then
    MISSING_VALUES="${MISSING_VALUES}  • OPENAI_API_KEY\n"
fi

if [ -z "$KEYCLOAK_ADMIN_PASSWORD" ]; then
    MISSING_VALUES="${MISSING_VALUES}  • KEYCLOAK_ADMIN_PASSWORD\n"
fi

if [ -n "$MISSING_VALUES" ]; then
    echo "❌ ERROR: Required values missing or empty in root .env file:"
    echo -e "$MISSING_VALUES"
    echo "Please set these values in $ROOT_ENV_FILE and try again."
    exit 1
fi

echo "   ✓ OpenAI API Key: [SET] (${#OPENAI_API_KEY} characters)"
echo "   ✓ Keycloak Admin Password: [SET] (${#KEYCLOAK_ADMIN_PASSWORD} characters)"

# Use Keycloak admin credentials from root .env
echo "🔐 Using Keycloak admin credentials from root .env file..."

# Generate server encryption keys and secrets
echo "🔑 Generating server encryption keys..."
ENCRYPTION_BASE_SECRET=$(generate_base64_secret 64)
CONVERSATION_MESSAGE_KEY=$(generate_base64_secret 32)
TENANT_OIDC_SECRET_KEY=$(generate_base64_secret 32)

# Generate SSL certificate and password
echo "📜 Generating SSL certificate..."
CERT_PASSWORD=$(generate_alphanumeric 24)
CERT_BASE64=$(generate_ssl_certificate "$CERT_PASSWORD")

# Create .env.local files from .env.example templates if they don't exist
echo "📝 Creating .env.local files from templates..."

# Copy template files to .env.local if they don't exist
for service in keycloak postgresql temporal server; do

    example_file="${service}/.env.example"
    local_file="${service}/.env.local"
    
    
    if [ -f "$example_file" ]; then
        if [ ! -f "$local_file" ]; then
            echo "   Creating $local_file from $example_file"
            cp "$example_file" "$local_file"
        fi
    else
        echo "   ⚠️  Template $example_file not found, skipping..."
    fi
done

# Update PostgreSQL credentials
echo "📝 Updating PostgreSQL credentials..."
update_env_file "temporal/.env.local" "POSTGRES_USER" "$POSTGRES_USER"
update_env_file "temporal/.env.local" "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD"
update_env_file "postgresql/.env.local" "POSTGRES_USER" "$POSTGRES_USER"
update_env_file "postgresql/.env.local" "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD"

# Update Keycloak credentials (using same DB credentials)
echo "📝 Updating Keycloak credentials..."
update_env_file "keycloak/.env.local" "KEYCLOAK_ADMIN_PASSWORD" "$KEYCLOAK_ADMIN_PASSWORD"
update_env_file "keycloak/.env.local" "KC_DB_USERNAME" "$POSTGRES_USER"
update_env_file "keycloak/.env.local" "KC_DB_PASSWORD" "$POSTGRES_PASSWORD"

# Update Server secrets
echo "📝 Updating server secrets..."
update_env_file "server/.env.local" "Certificates__AppServerPfxBase64" "$CERT_BASE64"
update_env_file "server/.env.local" "Certificates__AppServerCertPassword" "$CERT_PASSWORD"
update_env_file "server/.env.local" "EncryptionKeys__BaseSecret" "$ENCRYPTION_BASE_SECRET"
update_env_file "server/.env.local" "EncryptionKeys__UniqueSecrets__ConversationMessageKey" "$CONVERSATION_MESSAGE_KEY"
update_env_file "server/.env.local" "EncryptionKeys__UniqueSecrets__TenantOidcSecretKey" "$TENANT_OIDC_SECRET_KEY"

# Update OpenAI API key from root .env
echo "📝 Updating OpenAI API key in server configuration..."
update_env_file "server/.env.local" "Llm__ApiKey" "$OPENAI_API_KEY"

echo ""
echo "✅ Secret recreation completed successfully!"
echo ""
echo "📊 Generated secrets:"
echo "   🗄️  PostgreSQL password: ${POSTGRES_PASSWORD:0:8}... (32 chars)"
echo "   🔐 Keycloak admin password: ${KEYCLOAK_ADMIN_PASSWORD:0:8}... (16 chars)"
echo "   📜 SSL certificate password: ${CERT_PASSWORD:0:8}... (24 chars)"
echo "   📜 SSL certificate (PFX): ${CERT_BASE64:0:32}... (base64, ~4KB)"
echo "   🌐 WebSocket secrets: 2 secrets generated (32 chars each)"
echo "   🔑 Encryption keys: 3 keys generated (base64 encoded)"
echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "   • Database passwords have been randomly generated for security"
echo "   • Database credentials are shared between Temporal and Keycloak"
echo "   • Keycloak admin password and OpenAI API key are read from root .env file (REQUIRED)"
echo "   • Root .env file must exist and contain valid OPENAI_API_KEY and KEYCLOAK_ADMIN_PASSWORD"
echo "   • These secrets are now stored in .env.local files (not in git)"
echo ""
