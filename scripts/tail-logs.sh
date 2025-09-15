#!/bin/bash

# Function to show logs for all containers
show_all_logs() {
    echo "🔍 Showing recent logs from all containers:"
    echo "=============================================="
    for container in $(docker ps --format "{{.Names}}"); do
        echo
        echo "📦 === $container ==="
        docker logs --tail=5 --timestamps $container 2>&1 | sed "s/^/[$container] /"
    done
}

# Function to tail logs from all containers
tail_all_logs() {
    echo "🔄 Tailing logs from all containers (Ctrl+C to stop):"
    echo "====================================================="
    
    # Create named pipes for each container
    containers=$(docker ps --format "{{.Names}}")
    temp_dir=$(mktemp -d)
    
    # Start tailing each container in background
    for container in $containers; do
        docker logs -f --timestamps $container 2>&1 | sed "s/^/[$container] /" > "$temp_dir/$container.log" &
    done
    
    # Tail all log files
    tail -f "$temp_dir"/*.log
    
    # Cleanup on exit
    trap "kill $(jobs -p) 2>/dev/null; rm -rf $temp_dir" EXIT
}

# Function to tail specific service
tail_service() {
    local service=$1
    if docker ps --format "{{.Names}}" | grep -q "^${service}$"; then
        echo "📊 Tailing logs for $service (Ctrl+C to stop):"
        docker logs -f --timestamps "$service"
    else
        echo "❌ Container $service not found"
        echo "Available containers:"
        docker ps --format "{{.Names}}"
    fi
}

case "${1:-recent}" in
    "recent"|"show")
        show_all_logs
        ;;
    "tail"|"follow"|"f")
        tail_all_logs
        ;;
    "xians-server"|"server")
        tail_service "xians-server"
        ;;
    "xians-ui"|"ui")
        tail_service "xians-ui"
        ;;
    "keycloak")
        tail_service "keycloak"
        ;;
    "temporal")
        tail_service "temporal"
        ;;
    "mongodb"|"mongo")
        tail_service "xians-mongodb"
        ;;
    "postgresql"|"postgres")
        tail_service "postgresql"
        ;;
    "elasticsearch"|"elastic")
        tail_service "temporal-elasticsearch"
        ;;
    *)
        echo "🔍 XiansAi Log Monitor"
        echo "====================="
        echo
        echo "Usage: $0 [option]"
        echo
        echo "Options:"
        echo "  recent     - Show recent logs from all containers (default)"
        echo "  tail       - Tail all logs in real-time"
        echo "  server     - Tail XiansAi Server logs"
        echo "  ui         - Tail XiansAi UI logs"
        echo "  keycloak   - Tail Keycloak logs"
        echo "  temporal   - Tail Temporal logs"
        echo "  mongo      - Tail MongoDB logs"
        echo "  postgres   - Tail PostgreSQL logs"
        echo "  elastic    - Tail Elasticsearch logs"
        echo
        echo "Examples:"
        echo "  $0              # Show recent logs"
        echo "  $0 tail         # Tail all logs"
        echo "  $0 server       # Tail server logs only"
        ;;
esac