# Docker Configuration for XiansAi Platform

This document provides detailed information about the Docker setup for the XiansAi platform.

## 📦 Docker Images

The platform uses two pre-built Docker images from DockerHub:

### XiansAi Server
- **Image**: `xiansai/server:latest`
- **Base**: .NET 9.0 runtime (mcr.microsoft.com/dotnet/aspnet:9.0)
- **Port**: 8080 (mapped to host port 5000)
- **Health Check**: `/health` endpoint

### XiansAi UI
- **Image**: `xiansai/ui:latest`
- **Base**: Node.js Alpine
- **Port**: 80 (mapped to host port 3000)
- **Build**: React application served by nginx

## 🏗️ Unified Docker Compose Configuration

### Single `docker-compose.yml` File
- **Unified configuration**: One file supports both development and production
- **Environment variables**: Behavior controlled by `.env.development` and `.env.production` files
- **Smart defaults**: Development settings used when no environment specified
- **No duplication**: Eliminates maintenance overhead of separate files

### Environment-Specific Configurations

**Development (`.env.development`):**
- Uses `99xio/xiansai-server:latest` and `99xio/xiansai-ui:latest` images
- Lighter resource limits for development workstations
- Local logging driver for easier debugging
- Uses `mongo-healthcheck.js` for MongoDB health checking

**Production (`.env.production`):**
- Uses `xiansai/server:latest` and `xiansai/ui:latest` images
- Production-grade resource limits and logging
- JSON file logging with rotation (10MB max, 3 files)
- Uses `mongo-init.js` for MongoDB initialization
- Enhanced health check configurations

## 🌐 Networking

All services are connected via environment-specific Docker networks:
- **Development**: `xians-community-edition-network`
- **Production**: `xians-community-edition-network-prod`

This ensures secure communication between services and isolation from other Docker applications. The environment suffix prevents conflicts when running both development and production simultaneously.

## 💾 Volumes

### Development

- `xians-community-edition-data`: Server data volume
- `xians-mongodb-data`: MongoDB data volume

### Production

- `xians-community-edition-data-prod`: Server data volume with local driver
- `xians-mongodb-data-prod`: MongoDB data volume with local driver
- Server data mounted at `/app/data` for persistence across restarts

## 🔧 Environment Configuration

### Environment File Structure
The docker-compose files use individual environment files for each service:

#### Development Configuration
- `server/.env.development` - Complete server configuration with working development values
- `ui/.env.development` - UI configuration pointing to development server

#### Production Configuration  
- `server/.env.production` - Production server configuration (you need to customize this)
- `ui/.env.production` - Production UI configuration (you need to customize this)

This approach eliminates duplication and ensures each service has its own properly scoped configuration.

## 🚀 Deployment Options

### Option 1: Using start.sh Script (Recommended)
```bash
# Development
./start.sh

# Production
./start.sh --production

# Production (detached/background)
./start.sh --production --detached

# With custom options
./start.sh -p -d  # Short form
```

### Option 2: Direct Docker Compose
```bash
# Development
docker compose --env-file .env.development up -d

# Production
docker compose --env-file .env.production up -d

# Without environment file (uses development defaults)
docker compose up -d
```

## 📊 Resource Requirements

### Development Environment
- **RAM**: 2GB total (1GB server + 256MB UI + 512MB MongoDB)
- **CPU**: 1-2 cores
- **Disk**: 2GB for containers + data storage

### Production Environment
- **RAM**: 4GB total (2GB server + 512MB UI + 1GB MongoDB + 512MB system)
- **CPU**: 2+ cores recommended
- **Disk**: 10GB+ for data persistence and log storage

### Scalability Notes
- Resource limits are configurable via environment files
- MongoDB can be moved to external service for better scalability
- Server can be scaled horizontally with load balancer

## 🔍 Monitoring and Health Checks

### Health Check Endpoints
- **Server**: `http://localhost:5001/health`
- **UI**: `http://localhost:3001`
- **MongoDB**: Health checks performed internally via replica set status

### Container Health Status
```bash
# Check health status (development)
docker compose --env-file .env.development ps

# Check health status (production)
docker compose --env-file .env.production ps

# View health check logs
docker inspect <container_name> | grep -A 10 '"Health"'
```

## 📋 Logs and Troubleshooting

### Viewing Logs
```bash
# All services (development)
docker compose --env-file .env.development logs -f

# All services (production)
docker compose --env-file .env.production logs -f

# Specific service (development)
docker compose --env-file .env.development logs -f xiansai-server
docker compose --env-file .env.development logs -f xiansai-ui

# Specific service (production)
docker compose --env-file .env.production logs -f xiansai-server
docker compose --env-file .env.production logs -f xiansai-ui

# Last 100 lines
docker compose --env-file .env.development logs --tail=100 xiansai-server
```

### Production Logging
Production setup includes:
- Log rotation (10MB max per file)
- 3 log files retained
- JSON structured logging

## 🔄 Updates and Maintenance

### Updating Images
```bash
# Development - pull latest versions
docker compose --env-file .env.development pull

# Development - restart with new images
docker compose --env-file .env.development up -d

# Production - pull latest versions
docker compose --env-file .env.production pull

# Production - restart with new images
docker compose --env-file .env.production up -d
```

### Cleanup
```bash
# Remove stopped containers (development)
docker compose --env-file .env.development down

# Remove stopped containers (production)
docker compose --env-file .env.production down

# Remove volumes (⚠️ data loss!)
# Development
docker compose --env-file .env.development down -v

# Production
docker compose --env-file .env.production down -v

# Clean up unused images
docker image prune

# Clean up unused volumes
docker volume prune
```

## 🔐 Security Considerations

### Production Security
1. **Use secrets management** for sensitive environment variables
2. **Configure HTTPS/TLS** termination (reverse proxy recommended)
3. **Limit network exposure** - only expose necessary ports
4. **Regular updates** - pull latest images regularly
5. **Monitor logs** for security events

### Network Security
```yaml
# Example: Expose only UI publicly
ports:
  - "3001:80"  # UI only
  # - "5001:80"  # Server not exposed
  # - "27017:27017"  # MongoDB not exposed
```

## 🏷️ Image Tags and Versions

### Available Tags
- `latest`: Most recent stable release
- `v1.x.x`: Specific version tags
- `develop`: Development builds (not recommended for production)

### Pinning Versions
For production, consider pinning to specific versions:
```yaml
services:
  xiansai-server:
    image: xiansai/server:v1.2.3  # Instead of :latest
```

## 🤝 Contributing

To contribute to the Docker setup:

1. Test changes with both development and production configurations
2. Update documentation for any new environment variables
3. Ensure health checks work properly
4. Test resource limits and scaling 