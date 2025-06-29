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

### Available Options
```bash
./start.sh [options]

Options:
  -p, --prod, --production  Run in production mode
  -d, --detached           Run in detached mode (background)
  -h, --help               Show help
```

## ⚙️ Configuration Files

### `.env.development`
- Uses `99xio/xiansai-server:latest` and `99xio/xiansai-ui:latest` images
- Lighter resource limits for development
- Uses `mongo-healthcheck.js` for MongoDB health checking
- Local logging driver

### `.env.production`
- Uses `xiansai/server:latest` and `xiansai/ui:latest` images  
- Production-grade resource limits and logging
- Uses `mongo-init.js` for MongoDB initialization
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
├── mongo-healthcheck.js      # Development MongoDB health check
├── mongo-init.js            # Production MongoDB initialization
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