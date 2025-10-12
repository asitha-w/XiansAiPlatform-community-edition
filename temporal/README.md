# Temporal Service

Temporal workflow orchestration engine with mTLS support and automatic setup.

## Quick Start

**From project root:**
```bash
./start-all.sh
```

That's it! Everything is automatically configured via Docker Compose init containers:
- ✅ Database schema initialization
- ✅ Namespace registration (`xiansai`)
- ✅ Elasticsearch indices
- ✅ mTLS certificates

## Access

- **Frontend (gRPC)**: `localhost:7233` (mTLS enabled)
- **Web UI**: http://localhost:8080
- **Elasticsearch**: http://localhost:9200

## Automated Setup (Production Pattern)

The setup uses **Kubernetes-style init containers** for declarative, idempotent configuration:

1. **`temporal-schema-setup`** - Initializes PostgreSQL schemas (exits when done)
2. **`temporal-namespace-setup`** - Registers `xiansai` namespace (exits when done)
3. **`temporal`** - Main server (depends on schema completion)
4. **`temporal-ui`** - Web interface with Keycloak SSO

## Documentation

See the [`docs/`](docs/) directory for detailed documentation:

- **[SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** - Complete setup, configuration, and troubleshooting guide
- **[TEMPORAL_SERVER_MIGRATION.md](docs/TEMPORAL_SERVER_MIGRATION.md)** - Migration from auto-setup to server image
- **[KEYCLOAK_SSO_SETUP.md](docs/KEYCLOAK_SSO_SETUP.md)** - Keycloak SSO integration for Temporal UI

## Directory Structure

```
temporal/
├── certs/                      # mTLS certificates (auto-generated)
├── deprecated/
│   ├── dynamicconfig/         # Old dynamic config files
│   └── utilities/             # Optional manual scripts
├── docs/                       # Documentation
├── dynamicconfig/              # Active runtime configuration
│   ├── development-es.yaml    # Elasticsearch settings
│   └── docker.yaml            # Custom overrides
├── docker-compose.yml          # Service definitions with init containers
└── .env.example               # Configuration template
```

## Namespace

Workflows run in the **`xiansai`** namespace with 7-day retention (configurable in `.env.local`).

## Admin Commands

```bash
# Health check
docker exec temporal tctl cluster health

# List namespaces
docker exec temporal tctl namespace list

# List workflows in xiansai namespace
docker exec temporal tctl --namespace xiansai workflow list

# View logs
docker logs -f temporal
docker logs -f temporal-ui

# Check init container logs (for debugging)
docker logs temporal-schema-setup
docker logs temporal-namespace-setup
```

## Custom Search Attributes (Optional)

Default search attributes are available out-of-the-box. To add custom attributes:

```bash
docker exec temporal tctl --address temporal:7233 admin cluster add-search-attributes \
  --name customAttribute \
  --type Text \
  --namespace xiansai
```

Or use the deprecated utility script:
```bash
./deprecated/utilities/setup-search-attributes.sh
```

## Troubleshooting

### Init Containers Show "Exited"

This is **normal and expected**! Init containers run once and exit:
- `temporal-schema-setup` → Exited (0) = Success ✅
- `temporal-namespace-setup` → Exited (0) = Success ✅

Check their logs if you see exit code 1:
```bash
docker logs temporal-schema-setup
```

### Temporal UI Not Starting

Check if Keycloak is healthy:
```bash
docker ps | grep keycloak
# Should show "(healthy)" not "(unhealthy)"
```

If unhealthy, wait 30-60 seconds for Keycloak to fully start, then restart UI:
```bash
docker restart temporal-ui
```

### More Help

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md#troubleshooting) for detailed troubleshooting.
