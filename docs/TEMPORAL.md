# Temporal Workflow Engine Integration

This document explains how to use Temporal workflow engine with XiansAi Community Edition.

## Overview

We've integrated the official [Temporal docker-compose setup](https://github.com/temporalio/docker-compose) with your existing application. All Temporal-related files are organized in the `temporal/` directory. This provides:

- **Temporal Server**: Core workflow engine
- **PostgreSQL**: Temporal's database
- **Elasticsearch**: For advanced workflow visibility and search
- **Temporal Web UI**: Visual workflow monitoring and debugging
- **Admin Tools**: CLI tools for managing workflows

## File Structure

```
temporal/
├── docker-compose.yml    # Temporal services configuration
├── .env                  # Temporal version settings
└── dynamicconfig/        # Temporal dynamic configuration
```

## Quick Start

### Start Everything
```bash
./start-with-temporal.sh
```

### Stop Everything
```bash
./stop-with-temporal.sh
```

### Start Only Your Application (without Temporal)
```bash
./start.sh
```

## Access Points

| Service | URL/Address | Description |
|---------|-------------|-------------|
| Your Application UI | http://localhost:3001 | Main application interface |
| Your Application API | http://localhost:5001 | Application backend API |
| Temporal Web UI | http://localhost:8080 | Workflow monitoring and debugging |
| Temporal gRPC API | localhost:7233 | Temporal client connection |
| MongoDB | localhost:27017 | Your application database |
| Temporal PostgreSQL | localhost:5432 | Temporal's database |

## Using Temporal CLI

Create an alias for easy CLI access:
```bash
alias tctl="docker exec temporal-admin-tools tctl"
```

Example commands:
```bash
# Register a new namespace
tctl --ns my-namespace namespace register -rd 1

# List workflows
tctl workflow list

# Show workflow history
tctl workflow show -w <workflow-id>
```

## Search Attributes

Search attributes are automatically configured when starting with Temporal. The following search attributes are set up:

| Attribute | Type | Purpose |
|-----------|------|---------|
| `tenantId` | Keyword | Filter workflows by tenant |
| `userId` | Keyword | Filter workflows by user |
| `agent` | Keyword | Filter workflows by agent |

### Automatic Setup

Search attributes are automatically configured when you run:
```bash
./start-with-temporal.sh
```

### Manual Setup

If you need to set up search attributes manually:
```bash
./temporal/setup-search-attributes.sh
```

### Verification

To verify search attributes are properly configured:
```bash
./temporal/verify-search-attributes.sh
```

### Using Search Attributes in Code

When starting workflows, include search attributes:
```go
// Example in Go
workflowOptions := client.StartWorkflowOptions{
    ID:       "my-workflow-id",
    TaskQueue: "my-task-queue",
    SearchAttributes: map[string]interface{}{
        "tenantId": "tenant-123",
        "userId":   "user-456", 
        "agent":    "agent-789",
    },
}
```

### Querying with Search Attributes

In the Temporal Web UI or via CLI:
```bash
# Query workflows by tenant
tctl workflow list --query "tenantId='tenant-123'"

# Query workflows by user and agent
tctl workflow list --query "userId='user-456' AND agent='agent-789'"
```

## Environment Configuration

### Temporal Versions
The Temporal services use versions defined in `temporal/.env`:
- Temporal Server: v1.28.0
- Temporal UI: v2.34.0
- PostgreSQL: v16
- Elasticsearch: v7.17.27

### Environment Suffixes
Both your application and Temporal services support environment suffixes via the `ENVIRONMENT_SUFFIX` variable for running multiple environments.

## Development

### Connecting Your Application to Temporal

In your application code, connect to Temporal using:
```
Host: localhost
Port: 7233
```

### Network Integration

All services run on the shared `xians-community-edition-network`, so your application services can communicate with Temporal services using their container names:

- `temporal` - Temporal server
- `temporal-postgresql` - Temporal database  
- `temporal-elasticsearch` - Elasticsearch

## Data Persistence

The following volumes store persistent data:
- `temporal_postgresql_data` - Temporal database
- `temporal_elasticsearch_data` - Elasticsearch indices
- `xians-mongodb-data` - Your application database
- `xians-community-edition-data` - Your application data

## Troubleshooting

### Check Service Status
```bash
docker compose ps
docker compose -f temporal/docker-compose.yml ps
```

### View Logs
```bash
# Your application logs
docker compose logs -f xiansai-server

# Temporal logs
docker compose -f temporal/docker-compose.yml logs -f temporal
```

### Reset Everything
```bash
# Stop and remove all containers and volumes (WARNING: Deletes all data!)
docker compose down -v
docker compose -f temporal/docker-compose.yml down -v
```

## Resources

- [Temporal Documentation](https://docs.temporal.io/)
- [Temporal Go SDK](https://docs.temporal.io/dev-guide/go)
- [Temporal Java SDK](https://docs.temporal.io/dev-guide/java)
- [Temporal Python SDK](https://docs.temporal.io/dev-guide/python)
- [Official Temporal Docker Compose](https://github.com/temporalio/docker-compose) 