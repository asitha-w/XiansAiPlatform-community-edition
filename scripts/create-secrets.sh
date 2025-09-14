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

# Generate Keycloak admin credentials
echo "🔐 Generating Keycloak admin credentials..."
KEYCLOAK_ADMIN_PASSWORD=$(generate_alphanumeric 16)

# Generate server encryption keys and secrets
echo "🔑 Generating server encryption keys..."
ENCRYPTION_BASE_SECRET=$(generate_base64_secret 64)
CONVERSATION_MESSAGE_KEY=$(generate_base64_secret 32)
TENANT_OIDC_SECRET_KEY=$(generate_base64_secret 32)

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
update_env_file "server/.env.local" "EncryptionKeys__BaseSecret" "$ENCRYPTION_BASE_SECRET"
update_env_file "server/.env.local" "EncryptionKeys__UniqueSecrets__ConversationMessageKey" "$CONVERSATION_MESSAGE_KEY"
update_env_file "server/.env.local" "EncryptionKeys__UniqueSecrets__TenantOidcSecretKey" "$TENANT_OIDC_SECRET_KEY"

echo ""
echo "✅ Secret recreation completed successfully!"
echo ""
echo "📊 Generated secrets:"
echo "   🗄️  PostgreSQL password: ${POSTGRES_PASSWORD:0:8}... (32 chars)"
echo "   🔐 Keycloak admin password: ${KEYCLOAK_ADMIN_PASSWORD:0:8}... (16 chars)"
echo "   🔑 Base encryption secret: ${ENCRYPTION_BASE_SECRET:0:16}... (base64)"
echo "   🌐 Specific encryption keys: 2 secrets generated (32 chars each)"
echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "   • All passwords have been randomly generated for security"
echo "   • Database credentials are shared between Temporal and Keycloak"
echo "   • You still need to set your OpenAI API key in server/.env.local"
echo "   • These secrets are now stored in .env.local files (not in git)"
echo ""
