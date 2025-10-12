# Deprecated Utility Scripts

These scripts are **no longer required** for normal Temporal setup. They have been moved here as they are deprecated in favor of automatic configuration.

## Why These Are Deprecated

Temporal server with `ENABLE_ES=true` automatically handles:
- ✅ Elasticsearch index creation
- ✅ Default search attributes registration
- ✅ Visibility schema setup

## Scripts in This Directory

### `setup-elasticsearch.sh`
**Status:** ⚠️ Deprecated - Not needed  
**Why:** Temporal auto-creates Elasticsearch indices when `ENABLE_ES=true` is set.  
**When to use:** Only if you need custom index templates or specific Elasticsearch settings.

### `setup-search-attributes.sh`
**Status:** ⚠️ Deprecated - Optional  
**Why:** Default search attributes are available out-of-the-box.  
**When to use:** Only if you need to register custom search attributes beyond the defaults.

### `verify-search-attributes.sh`
**Status:** ✅ Keep as utility  
**Why:** Useful for manual verification and troubleshooting.  
**Usage:**
```bash
./temporal/deprecated/utilities/verify-search-attributes.sh
```

## Current Setup (Automatic)

The following happens automatically via `docker-compose.yml`:

1. **Schema Setup** → `temporal-schema-setup` init container
2. **Namespace Registration** → `temporal-namespace-setup` init container  
3. **Elasticsearch Indices** → Auto-created by Temporal server
4. **Search Attributes** → Default attributes available immediately

## If You Need Custom Search Attributes

If you need to add custom search attributes, you can still use `setup-search-attributes.sh` manually:

```bash
cd temporal/deprecated/utilities
./setup-search-attributes.sh
```

Or use `tctl` directly:
```bash
docker exec temporal tctl --address temporal:7233 admin cluster add-search-attributes \
  --name customAttribute \
  --type Text
```

## Migration Notes

- **Before:** Required manual execution of shell scripts from host
- **After:** Fully declarative setup via Docker Compose
- **Benefit:** Production-ready, Kubernetes-style init container pattern

