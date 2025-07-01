# Unified Docker Compose Configuration

This repository now uses a **single `docker-compose.yml`** file that supports both development and production environments through environment variables. This eliminates duplication and makes maintenance easier.

## 🏗️ How It Works

- **Single `docker-compose.yml`**: One file with environment variable placeholders
- **Environment files**: `.env.development` and `.env.production` control the configuration
- **Smart defaults**: Development settings are used when no environment is specified

## 🚀 Usage

### Development (Default)

```bash
# Using the start script (recommended)
./start.sh

# Or directly with Docker Compose
docker compose --env-file .env.development up -d
```

### Production

```bash
# Using the start script (recommended)
./start.sh --production

# Or directly with Docker Compose
docker compose --env-file .env.production up -d
```

### Available Scripts

```bash
# Start the platform
./start.sh [options]
  -p, --prod, --production  Run in production mode
  -d, --detached           Run in detached mode (background)
  -h, --help               Show help

# Pull latest images
./pull.sh [options]
  -e, --environment        Specify environment (default: local)
  -s, --server            Pull only server image
  -u, --ui                Pull only UI image
  -a, --all               Pull all images including dependencies
  -h, --help              Show help

# Stop the platform
./stop.sh [options]
  -e, --environment        Specify environment (default: local)
  -v, --volumes           Also remove volumes
  -h, --help              Show help
```

## ⚙️ Configuration Files

### `.env.development`

- Uses `99xio/xiansai-server:latest` and `99xio/xiansai-ui:latest` images
- Lighter resource limits for development
- Uses `db/mongo-healthcheck.js` for MongoDB health checking
- Local logging driver

### `.env.production`

- Uses `xiansai/server:latest` and `xiansai/ui:latest` images  
- Production-grade resource limits and logging
- Uses `db/mongo-healthcheck.js` for MongoDB health checking (replica set initialization handled by startup script)
- JSON file logging with rotation

## 🔧 Key Variables

The environment files control these aspects:

| Variable | Purpose | Dev Value | Prod Value |
|----------|---------|-----------|------------|
| `SERVER_IMAGE` | Server Docker image | `99xio/xiansai-server:latest` | `xiansai/server:latest` |
| `UI_IMAGE` | UI Docker image | `99xio/xiansai-ui:latest` | `xiansai/ui:latest` |
| `ENVIRONMENT_SUFFIX` | Container/volume suffix | _(empty)_ | `-prod` |
| `MONGO_MEMORY_LIMIT` | MongoDB memory limit | `512M` | `1G` |
| `SERVER_MEMORY_LIMIT` | Server memory limit | `1G` | `2G` |
| `LOGGING_DRIVER` | Log driver | `local` | `json-file` |

## 📁 File Structure

```
├── docker-compose.yml          # Unified compose file
├── .env.development           # Development configuration
├── .env.production           # Production configuration  
├── db/
│   ├── mongo-healthcheck.js # MongoDB health check script
│   └── mongo-startup.sh    # MongoDB startup script with replica set initialization
└── start.sh                # Startup script
```

## 🔄 Migration from Dual Files

If you were using the old `docker-compose.prod.yml` approach:

1. **Stop existing containers**:

   ```bash
   docker compose -f docker-compose.prod.yml down
   ```

2. **Use new approach**:

   ```bash
   ./start.sh --production
   ```

3. **Container names changed** (now include environment suffix):
   - `xians-mongodb` → `xians-mongodb-prod` (production)
   - `xians-server` → `xians-server-prod` (production)
   - `xians-ui` → `xians-ui-prod` (production)

## 💡 Benefits

- ✅ **No duplication**: Single source of truth for service definitions
- ✅ **Easy maintenance**: Changes in one place affect both environments  
- ✅ **Clear separation**: Environment-specific settings in separate files
- ✅ **Flexible**: Easy to add new environments (staging, testing, etc.)
- ✅ **Backward compatible**: Same functionality as before

## 🔄 Updating Images

### Using pull.sh script (Recommended)

```bash
# Pull latest for current environment
./pull.sh

# Pull for specific environment
./pull.sh -e production

# Pull only specific components
./pull.sh --server
./pull.sh --ui
./pull.sh --all

# Update workflow: pull, stop, start
./pull.sh
./stop.sh && ./start.sh
```

### Direct Docker Compose

```bash
# Development
docker compose --env-file .env.development pull
docker compose --env-file .env.development up -d

# Production
docker compose --env-file .env.production pull
docker compose --env-file .env.production up -d
```

## 🛠️ Advanced Usage

### Custom Environment

Create your own `.env.custom` file and use:

```bash
docker compose --env-file .env.custom up -d
```

### Override Specific Variables

```bash
SERVER_IMAGE=my-custom-server:latest docker compose up -d
```

### Multiple Environments

You can run both dev and prod simultaneously since they use different container names and networks.

## 🆘 Troubleshooting

### "Environment file not found"

Make sure you have `.env.development` and `.env.production` files in the root directory.

### "Container name conflicts"  

The new setup uses environment suffixes to avoid conflicts. Stop old containers first:

```bash
docker ps -a | grep xians- | awk '{print $1}' | xargs docker rm -f
```

### Resource Issues

Adjust memory limits in the environment files based on your system capacity. 