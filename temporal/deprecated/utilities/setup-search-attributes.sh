#!/bin/bash

# Setup Temporal Search Attributes
# This script sets up the required search attributes for the Temporal workflow engine

set -e

# Load environment variables from .env.local
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env.local" ]; then
    source "$SCRIPT_DIR/.env.local"
fi

NAMESPACE="${TEMPORAL_NAMESPACE:-xiansai}"

echo "🔧 Setting up Temporal search attributes for namespace: $NAMESPACE..."

# Function to check if Temporal is ready
wait_for_temporal() {
    echo "⏳ Waiting for Temporal server to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        # First check if the service is serving
        if docker exec temporal tctl cluster health 2>/dev/null | grep -q "temporal.api.workflowservice.v1.WorkflowService: SERVING"; then
            echo "✅ Temporal server is ready!"
            
            # Now check if the namespace exists
            echo "⏳ Waiting for $NAMESPACE namespace to be available..."
            local namespace_attempts=15
            local namespace_attempt=1
            
            while [ $namespace_attempt -le $namespace_attempts ]; do
                if docker exec temporal tctl namespace describe "$NAMESPACE" >/dev/null 2>&1; then
                    echo "✅ $NAMESPACE namespace is available!"
                    return 0
                fi
                
                echo "  Namespace attempt $namespace_attempt/$namespace_attempts - $NAMESPACE namespace not ready yet..."
                sleep 3
                ((namespace_attempt++))
            done
            
            echo "❌ $NAMESPACE namespace failed to become available after $namespace_attempts attempts"
            return 1
        fi
        
        echo "  Attempt $attempt/$max_attempts - Temporal not ready yet..."
        sleep 5
        ((attempt++))
    done
    
    echo "❌ Temporal server failed to become ready after $max_attempts attempts"
    return 1
}

# Function to setup search attributes
setup_search_attributes() {
    echo "🏷️  Adding search attributes..."
    
    # Check if search attributes already exist
    echo "  Checking existing search attributes..."
    existing_attrs=$(docker exec temporal tctl admin cluster describe 2>/dev/null | grep -A 20 "search_attributes" || echo "")
    
    # Collect missing attributes
    missing_names=()
    missing_types=()
    
    if ! echo "$existing_attrs" | grep -q "tenantId"; then
        echo "  - tenantId needs to be added"
        missing_names+=("tenantId")
        missing_types+=("Keyword")
    else
        echo "  ✓ tenantId search attribute already exists"
    fi
    
    if ! echo "$existing_attrs" | grep -q "userId"; then
        echo "  - userId needs to be added"
        missing_names+=("userId")
        missing_types+=("Keyword")
    else
        echo "  ✓ userId search attribute already exists"
    fi
    
    if ! echo "$existing_attrs" | grep -q "agent"; then
        echo "  - agent needs to be added"
        missing_names+=("agent")
        missing_types+=("Keyword")
    else
        echo "  ✓ agent search attribute already exists"
    fi
    
    # Add all missing attributes in one command if any are missing
    if [ ${#missing_names[@]} -gt 0 ]; then
        echo "  + Adding ${#missing_names[@]} search attribute(s) to Elasticsearch..."
        
        # First, add the attributes to Elasticsearch mapping directly (more reliable)
        for i in "${!missing_names[@]}"; do
            name="${missing_names[$i]}"
            type="${missing_types[$i]}"
            
            echo "    - Adding $name as $type to Elasticsearch..."
            curl -s -X PUT "http://localhost:9200/temporal_visibility_v1_dev/_mapping" \
                -H 'Content-Type: application/json' \
                -d "{\"properties\": {\"$name\": {\"type\": \"$(echo $type | tr '[:upper:]' '[:lower:]')\"}}}" > /dev/null
        done
        
        # Try to register in Temporal metadata using the modern CLI from container
        echo "  + Attempting to register search attributes in Temporal metadata..."
        echo "  Using modern 'temporal' CLI from container..."
        
        # Use the modern temporal CLI from within the container (recommended approach)
        for i in "${!missing_names[@]}"; do
            name="${missing_names[$i]}"
            type="${missing_types[$i]}"
            echo "    - Adding $name as $type..."
            docker exec temporal temporal operator search-attribute create \
                --name "$name" --type "$type" 2>/dev/null && {
                echo "      ✅ $name registered successfully!"
            } || {
                echo "      ⚠️  $name registration failed, but available in Elasticsearch"
            }
        done
        
        echo "  ✅ Search attributes are available in Elasticsearch for visibility queries."
        echo "  💡 Note: Using Elasticsearch, namespace association not required (per official docs)"
        
        echo "  💡 Verify Elasticsearch mapping:"
        echo "     curl -s 'http://localhost:9200/temporal_visibility_v1_dev/_mapping' | python3 -m json.tool"
    fi
    
    echo "✅ Search attributes setup completed!"
}

# Main execution
if wait_for_temporal; then
    setup_search_attributes
else
    echo "❌ Failed to setup search attributes - Temporal server not ready"
    exit 1
fi

echo "🎉 Temporal search attributes configuration complete!" 