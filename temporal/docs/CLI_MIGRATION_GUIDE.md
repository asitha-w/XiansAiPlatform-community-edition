# Temporal CLI Migration Guide

## Overview

This document details the migration from the deprecated `tctl` CLI to the modern `temporal` CLI in the XiansAI Platform. As of September 30, 2025, `tctl` is officially deprecated and no longer supported.

## Migration Summary

### Key Changes
- **Command Structure**: Commands reorganized under `temporal operator`
- **Flag Format**: Hyphens (`-`) instead of underscores (`_`)
- **Command Names**: Some commands renamed (e.g., `register` → `create`)
- **Output Formatting**: Enhanced with `--output` and `--pager` options

## Command Mappings

### Cluster Operations

| Old tctl Command | New temporal CLI Command | Notes |
|------------------|--------------------------|-------|
| `tctl cluster health` | `temporal operator cluster health` | Health check with modern syntax |
| `tctl admin cluster describe` | `temporal operator cluster describe` | Cluster information |
| `tctl admin cluster add-search-attributes` | `temporal operator search-attribute create` | Search attribute creation |

### Namespace Operations

| Old tctl Command | New temporal CLI Command | Notes |
|------------------|--------------------------|-------|
| `tctl namespace register` | `temporal operator namespace create` | Namespace creation |
| `tctl namespace describe` | `temporal operator namespace describe` | Namespace information |
| `tctl namespace list` | `temporal operator namespace list` | List namespaces |

### Search Attribute Operations

| Old tctl Command | New temporal CLI Command | Notes |
|------------------|--------------------------|-------|
| `tctl admin cluster add-search-attributes` | `temporal operator search-attribute create` | Create search attributes |
| `tctl admin cluster get-search-attributes` | `temporal operator search-attribute list` | List search attributes |

## Flag Changes

### TLS Configuration

| Old tctl Flag | New temporal CLI Flag | Example |
|---------------|----------------------|---------|
| `--tls_cert_path` | `--tls-cert-path` | `--tls-cert-path /path/to/cert.crt` |
| `--tls_key_path` | `--tls-key-path` | `--tls-key-path /path/to/key.key` |
| `--tls_ca_path` | `--tls-ca-path` | `--tls-ca-path /path/to/ca.crt` |

### Namespace Creation

| Old tctl Flag | New temporal CLI Flag | Example |
|---------------|----------------------|---------|
| `--owner_email` | `--email` | `--email admin@example.com` |
| `--retention` | `--retention` | `--retention 7d` (unchanged) |
| `--description` | `--description` | `--description "My Namespace"` (unchanged) |

## Implementation in XiansAI Platform

### 1. temporal-namespace-setup

**Before (tctl):**
```bash
tctl \
  --address temporal:7233 \
  --tls_cert_path ${TEMPORAL_UI_CERT} \
  --tls_key_path ${TEMPORAL_UI_KEY} \
  --tls_ca_path ${TEMPORAL_CA_CERT} \
  cluster health

tctl \
  --address temporal:7233 \
  --tls_cert_path ${TEMPORAL_UI_CERT} \
  --tls_key_path ${TEMPORAL_UI_KEY} \
  --tls_ca_path ${TEMPORAL_CA_CERT} \
  --namespace "xiansai" namespace register \
  --retention "7d" \
  --description "XiansAI Platform Workflows" \
  --owner_email "platform@xiansai.io"
```

**After (temporal CLI):**
```bash
temporal operator cluster health \
  --address temporal:7233 \
  --tls-cert-path ${TEMPORAL_UI_CERT} \
  --tls-key-path ${TEMPORAL_UI_KEY} \
  --tls-ca-path ${TEMPORAL_CA_CERT}

temporal operator namespace create \
  --address temporal:7233 \
  --tls-cert-path ${TEMPORAL_UI_CERT} \
  --tls-key-path ${TEMPORAL_UI_KEY} \
  --tls-ca-path ${TEMPORAL_CA_CERT} \
  --namespace "xiansai" \
  --retention "7d" \
  --description "XiansAI Platform Workflows" \
  --email "platform@xiansai.io"
```

### 2. temporal-search-attributes-setup

**Before (tctl):**
```bash
tctl \
  --address temporal:7233 \
  --tls_cert_path ${TEMPORAL_UI_CERT} \
  --tls_key_path ${TEMPORAL_UI_KEY} \
  --tls_ca_path ${TEMPORAL_CA_CERT} \
  admin cluster describe

docker exec temporal temporal operator search-attribute create \
  --name "tenantId" --type "Keyword" \
  --address temporal:7233 \
  --tls-cert-path ${TEMPORAL_UI_CERT} \
  --tls-key-path ${TEMPORAL_UI_KEY} \
  --tls-ca-path ${TEMPORAL_CA_CERT}
```

**After (temporal CLI):**
```bash
temporal operator cluster describe \
  --address temporal:7233 \
  --tls-cert-path ${TEMPORAL_UI_CERT} \
  --tls-key-path ${TEMPORAL_UI_KEY} \
  --tls-ca-path ${TEMPORAL_CA_CERT}

temporal operator search-attribute create \
  --name "tenantId" --type "Keyword" \
  --address temporal:7233 \
  --tls-cert-path ${TEMPORAL_UI_CERT} \
  --tls-key-path ${TEMPORAL_UI_KEY} \
  --tls-ca-path ${TEMPORAL_CA_CERT}
```

## Docker Image Updates

### Version Alignment

**Before:**
```yaml
image: temporalio/admin-tools:${TEMPORAL_ADMIN_VERSION:-${TEMPORAL_VERSION}}
# Where TEMPORAL_VERSION=1.28.0
```

**After:**
```yaml
image: temporalio/admin-tools:${TEMPORAL_ADMIN_VERSION:-1.28}
# Where TEMPORAL_ADMIN_VERSION=1.28
```

**Rationale:** The `temporalio/admin-tools:1.28.0` image doesn't exist. The correct version is `1.28`.

## XiansAI Custom Search Attributes

The platform registers the following custom search attributes:

| Attribute | Type | Purpose |
|-----------|------|---------|
| `tenantId` | Keyword | Multi-tenant isolation |
| `userId` | Keyword | User attribution |
| `agent` | Keyword | Platform identification |
| `systemScoped` | Bool | System-level workflow flag |

**Registration Command:**
```bash
temporal operator search-attribute create \
  --name "tenantId" --type "Keyword" \
  --address temporal:7233 \
  --tls-cert-path ${TEMPORAL_UI_CERT} \
  --tls-key-path ${TEMPORAL_UI_KEY} \
  --tls-ca-path ${TEMPORAL_CA_CERT}
```

## Verification Commands

### Check Cluster Health
```bash
docker exec temporal temporal operator cluster health \
  --address temporal:7233 \
  --tls-cert-path /etc/temporal/certs/temporal.crt \
  --tls-key-path /etc/temporal/certs/temporal.key \
  --tls-ca-path /etc/temporal/certs/ca.crt
```

### List Search Attributes
```bash
docker exec temporal temporal operator search-attribute list \
  --address temporal:7233 \
  --tls-cert-path /etc/temporal/certs/temporal.crt \
  --tls-key-path /etc/temporal/certs/temporal.key \
  --tls-ca-path /etc/temporal/certs/ca.crt
```

### Describe Namespace
```bash
docker exec temporal temporal operator namespace describe \
  --address temporal:7233 \
  --tls-cert-path /etc/temporal/certs/temporal.crt \
  --tls-key-path /etc/temporal/certs/temporal.key \
  --tls-ca-path /etc/temporal/certs/ca.crt \
  --namespace "xiansai"
```

## Migration Checklist

- [x] Update `temporal-namespace-setup` service
- [x] Update `temporal-search-attributes-setup` service
- [x] Fix Docker image version references
- [x] Update TLS flag formats
- [x] Replace `tctl` commands with `temporal operator` equivalents
- [x] Update namespace creation flags (`--owner_email` → `--email`)
- [x] Remove unnecessary `docker exec` wrappers in init containers
- [x] Update documentation comments

## Benefits of Migration

1. **Future-Proof**: Using the supported CLI that won't be deprecated
2. **Enhanced Features**: Better output formatting, pagination, and error handling
3. **Consistent Syntax**: Unified command structure across all operations
4. **Improved Performance**: Optimized for modern Temporal server versions
5. **Better Documentation**: Comprehensive help and examples

## Troubleshooting

### Common Issues

1. **Image Not Found**: Ensure using `temporalio/admin-tools:1.28` (not `1.28.0`)
2. **Flag Errors**: Use hyphens (`--tls-cert-path`) not underscores (`--tls_cert_path`)
3. **Command Not Found**: Use `temporal operator` prefix for admin commands
4. **Namespace Creation**: Use `--email` instead of `--owner_email`

### Debug Commands

```bash
# Check available commands
docker exec temporal temporal --help

# Check operator commands
docker exec temporal temporal operator --help

# Check specific command syntax
docker exec temporal temporal operator namespace create --help
```

## References

- [Temporal CLI Documentation](https://docs.temporal.io/cli)
- [Migration Guide](https://temporal.io/blog/using-the-temporal-cli)
- [Community Discussion](https://community.temporal.io/t/tctl-is-now-deprecated-make-the-switch-to-temporal-cli/18487)
- [GitHub Repository](https://github.com/temporalio/temporal-cli)

---

*This migration ensures the XiansAI Platform uses the modern, supported Temporal CLI while maintaining all existing functionality.*
