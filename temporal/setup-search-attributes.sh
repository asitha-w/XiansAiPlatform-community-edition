#!/bin/bash

# Setup Temporal Search Attributes
# This script sets up the required search attributes for the Temporal workflow engine

set -e

echo "🔧 Setting up Temporal search attributes..."

# Function to check if Temporal is ready
wait_for_temporal() {
    echo "⏳ Waiting for Temporal server to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        # First check if the service is serving
        if docker exec temporal tctl cluster health 2>/dev/null | grep -q "temporal.api.workflowservice.v1.WorkflowService: SERVING"; then
            echo "✅ Temporal server is ready!"
            
            # Now check if the default namespace exists
            echo "⏳ Waiting for default namespace to be available..."
            local namespace_attempts=15
            local namespace_attempt=1
            
            while [ $namespace_attempt -le $namespace_attempts ]; do
                if docker exec temporal tctl namespace describe default >/dev/null 2>&1; then
                    echo "✅ Default namespace is available!"
                    return 0
                fi
                
                echo "  Namespace attempt $namespace_attempt/$namespace_attempts - Default namespace not ready yet..."
                sleep 3
                ((namespace_attempt++))
            done
            
            echo "❌ Default namespace failed to become available after $namespace_attempts attempts"
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
        echo "  + Adding ${#missing_names[@]} search attribute(s) non-interactively..."
        
        # Build command with all missing attributes
        cmd="docker exec temporal tctl admin cluster add-search-attributes"
        for name in "${missing_names[@]}"; do
            cmd="$cmd --name $name"
        done
        for type in "${missing_types[@]}"; do
            cmd="$cmd --type $type"
        done
        
        # Execute with automatic yes response using echo and -i flag  
        echo "Y" | docker exec -i temporal tctl admin cluster add-search-attributes \
            $(printf -- "--name %s " "${missing_names[@]}") \
            $(printf -- "--type %s " "${missing_types[@]}")
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