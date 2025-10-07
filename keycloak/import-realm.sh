#!/bin/bash

# Keycloak Realm Import Script via Admin API
# Alternative method to import realms after Keycloak is running

set -e

# Configuration
KEYCLOAK_URL=${KEYCLOAK_URL:-http://keycloak:9080}
KEYCLOAK_ADMIN_USER=${KEYCLOAK_ADMIN_USER:-admin}
KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-admin}
REALM_FILE=${1:-realms/xiansai-realm.json}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔐 Keycloak Realm Import via Admin API"
echo "====================================="

# Check if realm file exists
if [ ! -f "$REALM_FILE" ]; then
    echo -e "${RED}❌ Realm file not found: $REALM_FILE${NC}"
    echo "Usage: $0 [realm-file.json]"
    echo "Example: $0 realms/xianAI-realm.json"
    exit 1
fi

echo "📁 Realm file: $REALM_FILE"
echo "🌐 Keycloak URL: $KEYCLOAK_URL"

# Function to get admin access token
get_admin_token() {
    echo "🔑 Getting admin access token..."
    
    local response=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$KEYCLOAK_ADMIN_USER" \
        -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
        -d "grant_type=password" \
        -d "client_id=admin-cli")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to connect to Keycloak${NC}"
        exit 1
    fi
    
    local token=$(echo "$response" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
    
    if [ -z "$token" ]; then
        echo -e "${RED}❌ Failed to get admin token${NC}"
        echo "Response: $response"
        exit 1
    fi
    
    echo "✅ Admin token obtained"
    echo "$token"
}

# Function to check if realm exists
realm_exists() {
    local realm_name="$1"
    local token="$2"
    
    local response=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$realm_name" \
        -H "Authorization: Bearer $token" \
        -w "%{http_code}")
    
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        return 0  # Realm exists
    else
        return 1  # Realm doesn't exist
    fi
}

# Function to import realm
import_realm() {
    local realm_file="$1"
    local token="$2"
    
    echo "📤 Importing realm from $realm_file..."
    
    # Create temporary file with environment variables substituted
    local temp_file=$(mktemp)
    echo "🔄 Substituting environment variables..."
    
    # Load environment variables from .env.local if it exists
    if [ -f ".env.local" ]; then
        set -a  # automatically export all variables
        source .env.local
        set +a  # stop automatically exporting
    fi
    
    # Substitute environment variables in the realm file
    envsubst < "$realm_file" > "$temp_file"
    
    local response=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d @"$temp_file" \
        -w "%{http_code}")
    
    # Clean up temporary file
    rm -f "$temp_file"
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ Realm imported successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to import realm (HTTP $http_code)${NC}"
        if [ -n "$body" ]; then
            echo "Error details: $body"
        fi
        return 1
    fi
}

# Function to update existing realm
update_realm() {
    local realm_name="$1"
    local realm_file="$2"
    local token="$3"
    
    echo "🔄 Updating existing realm: $realm_name"
    
    # Create temporary file with environment variables substituted
    local temp_file=$(mktemp)
    echo "🔄 Substituting environment variables..."
    
    # Load environment variables from .env.local if it exists
    if [ -f ".env.local" ]; then
        set -a  # automatically export all variables
        source .env.local
        set +a  # stop automatically exporting
    fi
    
    # Substitute environment variables in the realm file
    envsubst < "$realm_file" > "$temp_file"
    
    local response=$(curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$realm_name" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d @"$temp_file" \
        -w "%{http_code}")
    
    # Clean up temporary file
    rm -f "$temp_file"
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "204" ]; then
        echo -e "${GREEN}✅ Realm updated successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to update realm (HTTP $http_code)${NC}"
        if [ -n "$body" ]; then
            echo "Error details: $body"
        fi
        return 1
    fi
}

# Main execution
main() {
    # Wait for Keycloak to be ready
    echo "⏳ Waiting for Keycloak to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$KEYCLOAK_URL/health/ready" > /dev/null 2>&1; then
            echo "✅ Keycloak is ready!"
            break
        fi
        
        echo "  Attempt $attempt/$max_attempts - Keycloak not ready yet..."
        sleep 5
        ((attempt++))
        
        if [ $attempt -gt $max_attempts ]; then
            echo -e "${RED}❌ Keycloak failed to become ready after $max_attempts attempts${NC}"
            exit 1
        fi
    done
    
    # Get admin token
    local token=$(get_admin_token)
    
    # Extract realm name from JSON file
    local realm_name=$(grep -o '"realm"[[:space:]]*:[[:space:]]*"[^"]*' "$REALM_FILE" | sed 's/"realm"[[:space:]]*:[[:space:]]*"//')
    
    if [ -z "$realm_name" ]; then
        echo -e "${RED}❌ Could not extract realm name from $REALM_FILE${NC}"
        exit 1
    fi
    
    echo "🏛️  Realm name: $realm_name"
    
    # Check if realm exists
    if realm_exists "$realm_name" "$token"; then
        echo -e "${YELLOW}⚠️  Realm '$realm_name' already exists${NC}"
        
        # Ask for confirmation to update
        read -p "Do you want to update the existing realm? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            update_realm "$realm_name" "$REALM_FILE" "$token"
        else
            echo "Import cancelled"
            exit 0
        fi
    else
        # Import new realm
        import_realm "$REALM_FILE" "$token"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Realm import completed successfully!${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "  • Access Keycloak Admin Console: $KEYCLOAK_URL/admin"
    echo "  • Select realm: $realm_name"
    echo "  • Configure clients, users, and roles as needed"
}

# Show usage if help requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo "Usage: $0 [realm-file.json]"
    echo ""
    echo "Import a Keycloak realm via Admin API"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  KEYCLOAK_URL            Keycloak base URL (default: http://keycloak:9080)"
    echo "  KEYCLOAK_ADMIN_USER     Admin username (default: admin)"
    echo "  KEYCLOAK_ADMIN_PASSWORD Admin password (default: admin)"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Import default realm (realms/xianAI-realm.json)"
    echo "  $0 realms/my-realm.json             # Import specific realm file"
    echo "  KEYCLOAK_URL=http://keycloak:9080 $0 # Use different Keycloak URL"
    exit 0
fi

# Run main function
main 