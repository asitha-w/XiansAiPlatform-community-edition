# Migration Guide: Dual Files → Unified Docker Compose

This guide helps you migrate from the old dual-file Docker Compose setup (`docker-compose.yml` + `docker-compose.prod.yml`) to the new unified configuration.

## 🔄 What Changed

- ✅ **Single file**: `docker-compose.yml` now handles both environments
- ✅ **Environment files**: `.env.development` and `.env.production` control behavior
- ✅ **No duplication**: Maintenance overhead eliminated
- ✅ **Same functionality**: All features preserved

## 📋 Migration Steps

### 1. Stop Existing Containers

If you have containers running with the old setup:

```bash
# Stop development containers
docker compose down

# Stop production containers (if you had them)
docker compose -f docker-compose.prod.yml down
```

### 2. Verify New Files

Make sure you have these files:
- ✅ `docker-compose.yml` (updated unified version)
- ✅ `.env.development` (Docker Compose config for dev)
- ✅ `.env.production` (Docker Compose config for prod)
- ✅ `db/mongo-healthcheck.js` (health check script)
- ✅ `db/mongo-startup.sh` (startup script with replica set initialization)

### 3. Update Your Commands

**Old approach:**
```bash
# Development
docker compose up -d

# Production  
docker compose -f docker-compose.prod.yml up -d
```

**New approach:**
```bash
# Development (recommended)
./start.sh

# Production (recommended)
./start.sh --production

# Or use Docker Compose directly:
# Development
docker compose --env-file .env.development up -d

# Production
docker compose --env-file .env.production up -d
```

### 4. Container Name Changes

Containers now include environment suffixes:

| Old Name | New Name (Dev) | New Name (Prod) |
|----------|----------------|-----------------|
| `xians-mongodb` | `xians-mongodb` | `xians-mongodb-prod` |
| `xians-server` | `xians-server` | `xians-server-prod` |
| `xians-ui` | `xians-ui` | `xians-ui-prod` |

### 5. Volume Name Changes

Volumes now include environment suffixes:

| Old Name | New Name (Dev) | New Name (Prod) |
|----------|----------------|-----------------|
| `xians-mongodb-data` | `xians-mongodb-data` | `xians-mongodb-data-prod` |
| `xians-community-edition-data` | `xians-community-edition-data` | `xians-community-edition-data-prod` |

## 🔧 Troubleshooting

### "Container name already in use"

Clean up old containers:

```bash
docker ps -a | grep xians- | awk '{print $1}' | xargs docker rm -f
```

### "Volume already exists"

If you get volume conflicts, you can:
1. **Rename old volumes** (preserves data):
   ```bash
   docker volume create xians-mongodb-data-old
   # Then manually copy data if needed
   ```

2. **Remove old volumes** (⚠️ data loss):
   ```bash
   docker volume rm xians-mongodb-data
   docker volume rm xians-community-edition-data
   ```

### "Port already in use"

The ports remain the same (3001, 5001, 27017), so make sure no other services are using them.

## ✅ Verification

After migration, verify everything works:

```bash
# Start development environment
./start.sh

# Check services are running
docker compose --env-file .env.development ps

# Check health
curl http://localhost:5001/health
curl http://localhost:3001

# Test production
./start.sh --production
```

## 🆘 Need Help?

If you encounter issues:

1. **Check logs**:
   ```bash
   docker compose --env-file .env.development logs -f
   ```

2. **Verify environment files exist**:
   ```bash
   ls -la .env.* server/.env.* ui/.env.*
   ```

3. **Compare with docs/UNIFIED-COMPOSE.md** for detailed configuration info

4. **Clean slate approach** (⚠️ data loss):
   ```bash
   docker compose down -v
   docker system prune -f
   ./start.sh
   ```

## 💡 Benefits of New Approach

- **Easier maintenance**: Single compose file to update
- **No duplication**: Environment differences in separate files
- **Flexible**: Easy to add staging/testing environments
- **Clear separation**: Dev and prod can run simultaneously
- **Better defaults**: Smart fallbacks when env vars not set 