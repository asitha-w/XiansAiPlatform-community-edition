# Temporal Server Migration: auto-setup → server

## Current Setup Analysis

### Current Image: `temporalio/auto-setup`

**What it does:**
- Automatically creates database schemas on startup
- Bundles all Temporal services in one container (frontend, matching, history, worker)
- Has convenience environment variables for basic setup
- **Limited TLS/mTLS configuration** via environment variables (not working for frontend gRPC)

**Current Configuration:**

```yaml
# From docker-compose.yml
image: temporalio/auto-setup:${TEMPORAL_VERSION}  # v1.28.0
environment:
  # Database
  - DB=postgres12
  - DB_PORT=5432
  - POSTGRES_USER=${POSTGRES_USER}
  - POSTGRES_PWD=${POSTGRES_PASSWORD}
  - POSTGRES_SEEDS=postgresql
  
  # Elasticsearch
  - ENABLE_ES=true
  - ES_SEEDS=elasticsearch
  - ES_VERSION=v7
  - ES_VIS_INDEX=temporal_visibility_v1_dev
  
  # Dynamic Config
  - DYNAMIC_CONFIG_FILE_PATH=config/dynamicconfig/development-es.yaml
  
  # Addresses (for internal use)
  - TEMPORAL_ADDRESS=temporal:7233
  - TEMPORAL_CLI_ADDRESS=temporal:7233
  
  # TLS (NOT WORKING - auto-setup doesn't properly enable TLS on gRPC)
  - TEMPORAL_TLS_CERT=/etc/temporal/certs/temporal.crt
  - TEMPORAL_TLS_KEY=/etc/temporal/certs/temporal.key
  - TEMPORAL_TLS_CA=/etc/temporal/certs/ca.crt
  - TEMPORAL_TLS_REQUIRE_CLIENT_AUTH=true
```

### Dynamic Configuration Files

Located in `temporal/dynamicconfig/`:

**1. `development-es.yaml`** (Currently used):
```yaml
# Maximum workflow/activity ID length
limit.maxIDLength:
  - value: 255
    constraints: {}

# Force refresh search attributes cache on read (dev only)
system.forceSearchAttributesCacheRefreshOnRead:
  - value: true
    constraints: {}

# Disable logger rate limiting (dev only)
system.enableLoggerRateLimiting:
  - value: false
    constraints: {}

# Enable advanced visibility (Elasticsearch)
system.advancedVisibilityWritingMode:
  - value: "on"
    constraints: {}

# Elasticsearch processor settings
system.elasticsearchProcessorNumOfWorkers:
  - value: 1
    constraints: {}

system.elasticsearchProcessorBulkActions:
  - value: 1000
    constraints: {}

system.elasticsearchProcessorBulkSize:
  - value: 2097152  # 2MB
    constraints: {}

system.elasticsearchProcessorFlushInterval:
  - value: "1s"
    constraints: {}
```

**2. `development-sql.yaml`**:
```yaml
limit.maxIDLength:
  - value: 255
    constraints: {}

system.forceSearchAttributesCacheRefreshOnRead:
  - value: true
    constraints: {}
```

**3. `development-cass.yaml`**:
```yaml
system.forceSearchAttributesCacheRefreshOnRead:
  - value: true
    constraints: {}
```

**4. `docker.yaml`**: Empty (for custom overrides)

### Ports Exposed

- **7233** - Frontend gRPC (workflow/activity operations)
- **7234** - Internal services (not exposed in current setup)
- **6933** - Metrics (not exposed in current setup)

---

## Migration Plan: Switch to `temporalio/server`

### Why Migrate?

1. **Full TLS/mTLS Control**: `server` image respects standard Temporal config.yaml with complete TLS settings
2. **Production-Ready**: Recommended for production deployments
3. **Flexibility**: Can configure individual services (frontend, matching, history, worker)
4. **Standard Configuration**: Uses Temporal's native config format

### What Needs to Change?

#### 1. Create `config/config.yaml`

New file: `temporal/config/config.yaml`

Must include:
- **Global settings**: Log level, metrics
- **Database (persistence)**: PostgreSQL connection
- **Frontend service**: Port 7233, TLS configuration, authorization
- **Matching service**: Port 7235
- **History service**: Port 7234
- **Worker service**: Port 7239
- **Elasticsearch visibility**: Connection and index settings
- **TLS configuration**: Server certificates, client CA, mTLS requirements

#### 2. Update `docker-compose.yml`

Changes needed:
- Switch image: `temporalio/auto-setup` → `temporalio/server`
- Remove auto-setup specific env vars (DB, ENABLE_ES, etc.)
- Add: `CONFIG_FILE=/etc/temporal/config/config.yaml`
- Add volume mount for config file
- Keep certificate mounts
- Handle database schema initialization (one-time setup)

#### 3. Database Schema Initialization

`auto-setup` automatically creates schemas. With `server`, we need to:
- Run schema setup once using `temporal-sql-tool` or
- Use an init container, or
- Run setup commands manually before first start

#### 4. Environment Variables to Config Mapping

| auto-setup Env Var | config.yaml Location |
|-------------------|---------------------|
| `DB=postgres12` | `persistence.default.sql.driver: postgres12` |
| `POSTGRES_SEEDS` | `persistence.default.sql.host` |
| `POSTGRES_USER` | `persistence.default.sql.user` |
| `POSTGRES_PWD` | `persistence.default.sql.password` |
| `ES_SEEDS` | `persistence.visibility.elasticsearch.url` |
| `ES_VERSION` | `persistence.visibility.elasticsearch.version` |
| `ES_VIS_INDEX` | `persistence.visibility.elasticsearch.indices` |
| `TEMPORAL_TLS_CERT` | `global.tls.frontend.server.certFile` |
| `TEMPORAL_TLS_KEY` | `global.tls.frontend.server.keyFile` |
| `TEMPORAL_TLS_CA` | `global.tls.frontend.client.caFile` |
| `TEMPORAL_TLS_REQUIRE_CLIENT_AUTH` | `global.tls.frontend.server.requireClientAuth` |

---

## Benefits of Migration

✅ **Working mTLS**: Proper TLS configuration on gRPC frontend  
✅ **Standard Config**: Use Temporal's official configuration format  
✅ **Production Ready**: Recommended approach for production deployments  
✅ **Better Control**: Fine-tune individual service settings  
✅ **Maintainable**: Easier to debug and understand  

---

## Next Steps

1. ✅ Document current setup (this file)
2. ⏳ Create `temporal/config/config.yaml` with all settings
3. ⏳ Update `temporal/docker-compose.yml` to use `temporalio/server`
4. ⏳ Add database schema initialization step
5. ⏳ Test startup and verify TLS is working
6. ⏳ Update documentation (`temporal/README.md` if exists)

---

## References

- [Temporal Server Configuration](https://docs.temporal.io/references/configuration)
- [Temporal Docker Compose Examples](https://github.com/temporalio/docker-compose)
- [Temporal TLS Configuration](https://docs.temporal.io/self-hosted-guide/security#tls)

