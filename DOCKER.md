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

## 🏗️ Docker Compose Files

### `docker-compose.yml` (Development)
- Suitable for development and testing
- Uses memory cache instead of Redis
- Console email provider
- Mock LLM provider
- Basic resource limits

### `docker-compose.prod.yml` (Production)
- Production-optimized configuration
- Requires `.env.production` file
- Enhanced resource limits and logging
- Volume persistence
- Production-grade health checks

## 🌐 Networking

All services are connected via the `xians-network` Docker network:
- **Development**: `xians-network`
- **Production**: `xians-network-prod`

This ensures secure communication between services and isolation from other Docker applications.

## 💾 Volumes

### Development
- `xians-data`: Shared data volume

### Production
- `xians-data-prod`: Persistent data volume with local driver
- Server data mounted at `/app/data`

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

### Option 1: Using start.sh Script
```bash
# Development
./start.sh

# Production (detached)
./start.sh --production --detached

# With custom options
./start.sh -p -d  # Short form
```

### Option 2: Direct Docker Compose
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Resource Requirements

### Minimum Requirements
- **RAM**: 2GB total (1GB server + 512MB UI)
- **CPU**: 1 core
- **Disk**: 1GB for containers + data storage

### Recommended Production
- **RAM**: 4GB total (2GB server + 1GB UI + 1GB system)
- **CPU**: 2+ cores
- **Disk**: 10GB+ for data persistence

## 🔍 Monitoring and Health Checks

### Health Check Endpoints
- **Server**: `http://localhost:5000/health`
- **UI**: `http://localhost:3000`

### Container Health Status
```bash
# Check health status
docker-compose ps

# View health check logs
docker inspect <container_name> | grep -A 10 '"Health"'
```

## 📋 Logs and Troubleshooting

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f xiansai-server
docker-compose logs -f xiansai-ui

# Last 100 lines
docker-compose logs --tail=100 xiansai-server
```

### Production Logging
Production setup includes:
- Log rotation (10MB max per file)
- 3 log files retained
- JSON structured logging

## 🔄 Updates and Maintenance

### Updating Images
```bash
# Pull latest versions
docker-compose pull

# Restart with new images
docker-compose up -d
```

### Cleanup
```bash
# Remove stopped containers
docker-compose down

# Remove volumes (⚠️ data loss!)
docker-compose down -v

# Clean up unused images
docker image prune
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
  - "80:80"  # UI only
  # - "5000:8080"  # Server not exposed
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