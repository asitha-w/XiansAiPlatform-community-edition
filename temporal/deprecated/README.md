# Deprecated Temporal Configuration Files

This directory contains configuration files from previous setups that are no longer used in the current configuration.

## Files

### dynamicconfig/

- **`development-cass.yaml`** - Dynamic config for Cassandra database
  - **Why deprecated:** We use PostgreSQL, not Cassandra
  - **Alternative:** `development-es.yaml` (PostgreSQL + Elasticsearch)

- **`development-sql.yaml`** - Dynamic config for basic SQL visibility
  - **Why deprecated:** We use Elasticsearch for advanced visibility features
  - **Alternative:** `development-es.yaml` (with Elasticsearch)

## Current Setup

Our setup uses:
- **Database:** PostgreSQL
- **Visibility:** Elasticsearch (advanced search capabilities)
- **Dynamic Config:** `dynamicconfig/development-es.yaml`

## Why Keep These Files?

These files are retained for reference in case:
1. Users want to switch to Cassandra database
2. Users want to use basic SQL visibility instead of Elasticsearch
3. Migration or rollback scenarios

## Migration History

These files were part of the original `temporalio/auto-setup` configuration which supported multiple database backends. The current `temporalio/server` setup is optimized for PostgreSQL + Elasticsearch.

