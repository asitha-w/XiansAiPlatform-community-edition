# XiansAi Platform - Community Edition

Welcome to the XiansAi Platform Community Edition! This repository provides a simple Docker Compose setup to get you started with the XiansAi platform quickly and easily.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed on your system
- At least 4GB of available RAM
- Internet connection to download the Docker images

### Getting Started

1. **Clone this repository:**

   ```bash
   git clone <repository-url>
   cd community-edition
   ```

2. **Configure your environment:**

   The platform is pre-configured for local development with:
   - `.env.local` (Docker Compose configuration)
   - `server/.env.local` (Server configuration)  
   - `ui/.env.local` (UI configuration)
   
   For other environments (production, staging, etc.), you can create additional `.env.*` files by copying and customizing the local ones.

3. **Start the platform:**

   ```bash
   # Start with default local environment
   ./start.sh
   
   # Or specify a different environment
   ./start.sh -e production
   
   # Run in background
   ./start.sh --detached
   ```
   
   **Management scripts:**
   - `./start.sh` - Start the platform
   - `./stop.sh` - Stop the platform  
   - `./pull.sh` - Pull latest images
   - `./reset.sh` - Complete reset (removes all data)
   
   Each script supports `-e environment` and `--help` options.

4. **Access the applications:**

   - **XiansAi UI**: [http://localhost:3001](http://localhost:3001)
   - **XiansAi Server API**: [http://localhost:5001](http://localhost:5001)

## 📋 Configuration

### Environment Files

The platform uses a **unified Docker Compose configuration** with environment-specific settings:

**Main Configuration Files:**
- `.env.local` - Docker Compose configuration (default)
- `server/.env.local` - Server configuration
- `ui/.env.local` - UI configuration
- `temporal/.env.local` - Temporal configuration

**Custom Environments:**
You can create additional environments by copying the `.local` files:
```bash
cp .env.local .env.production
cp server/.env.local server/.env.production  
cp ui/.env.local ui/.env.production
```

#### Key Configuration Sections

- **Database**: MongoDB connection and database name
- **Authentication**: Auth0 or Azure B2C configuration  
- **AI/LLM**: OpenAI or other LLM provider settings
- **Email**: Email service configuration
- **Caching**: Redis or memory cache settings
- **Workflow Engine**: Temporal workflow configuration
- **CORS**: Allowed origins for cross-origin requests

### Local Development Configuration

The default `.env.local` file is configured for local development with:

- Memory cache instead of Redis
- Console email provider  
- Mock LLM provider
- Development CORS settings
- Local resource limits

For production deployments, you'll want to configure real services (Redis, email providers, LLM APIs, etc.) in your production environment files.

## 🏗️ Architecture

The platform consists of three main services:

### MongoDB Database

- **Image**: `mongo:latest`
- **Port**: 27017
- **Purpose**: Document database with replica set configuration

### XiansAi Server

- **Image**: `99xio/xiansai-server:latest` (configurable via environment)
- **Port**: 5001 (mapped to container port 80)
- **Technology**: .NET 9.0
- **Purpose**: Backend API and workflow engine

### XiansAi UI

- **Image**: `99xio/xiansai-ui:latest` (configurable via environment)
- **Port**: 3001 (mapped to container port 80)
- **Technology**: React
- **Purpose**: Web-based user interface

All services are connected via environment-specific Docker networks and use separate volumes for data persistence.

## 🔧 Management Commands

### Start the platform

```bash
# Default local environment
./start.sh

# Different environment  
./start.sh -e production

# Background mode
./start.sh --detached

# Show help for more options
./start.sh --help
```

### Stop the platform

```bash
# Stop services (keeps data)
./stop.sh

# Stop specific environment
./stop.sh -e production

# Stop and remove volumes (DELETE ALL DATA)
./stop.sh --volumes

# Show help for more options
./stop.sh --help
```

### Pull latest images

```bash
# Pull latest server and UI images (default)
./pull.sh

# Pull for specific environment
./pull.sh -e production

# Pull only server image
./pull.sh --server

# Pull only UI image
./pull.sh --ui

# Pull all images including dependencies
./pull.sh --all

# Show help for more options
./pull.sh --help
```

### Complete reset (will lose all data)

```bash
# Complete reset with confirmation prompt
./reset.sh

# Reset specific environment
./reset.sh -e production

# Force reset without confirmation (DANGEROUS)
./reset.sh --force

# Show help for more options
./reset.sh --help
```

### View logs

```bash
# All services
docker compose --env-file .env.local logs -f

# Specific service
docker compose --env-file .env.local logs -f xiansai-server
docker compose --env-file .env.local logs -f xiansai-ui

# For other environments, replace .env.local with your environment file
docker compose --env-file .env.production logs -f
```

### Update to latest versions

```bash
# Method 1: Using the pull script (recommended)
./pull.sh                    # Pull latest server and UI images
./stop.sh && ./start.sh      # Restart with new images

# Method 2: Pull all images including dependencies
./pull.sh --all
./stop.sh && ./start.sh

# Method 3: Manual Docker Compose approach
./stop.sh
docker compose --env-file .env.local pull
./start.sh

# For specific environments
./pull.sh -e production
./stop.sh -e production && ./start.sh -e production
```

### Restart a specific service

```bash
docker compose --env-file .env.local restart xiansai-server
docker compose --env-file .env.local restart xiansai-ui

# For other environments, replace .env.local with your environment file
docker compose --env-file .env.production restart xiansai-server
```

### Direct Docker Compose usage

For advanced users, you can also use Docker Compose directly:

```bash
# Start services
docker compose --env-file .env.local up -d

# Stop services
docker compose --env-file .env.local down

# Stop and remove volumes
docker compose --env-file .env.local down -v
```

## 🔍 Troubleshooting

### Health Checks

Both services include health checks:

- Server health check: `http://localhost:5001/health`
- UI health check: `http://localhost:3001`

### Common Issues

1. **Services won't start**: Check that ports 3001 and 5001 are not in use
2. **Database connection issues**: Verify MongoDB connection string
3. **Authentication errors**: Check Auth0 configuration
4. **CORS errors**: Verify allowed origins in configuration
5. **Environment file not found**: Use `./start.sh -h` to see available options and check existing `.env.*` files

### Logs and Debugging

View detailed logs for troubleshooting:

```bash
# View server logs
docker compose --env-file .env.local logs xiansai-server

# View UI logs
docker compose --env-file .env.local logs xiansai-ui

# Follow logs in real-time
docker compose --env-file .env.local logs -f
```

## 🔒 Security Considerations

For production deployments:

1. **Use secure passwords and secrets**
2. **Configure HTTPS/TLS certificates**
3. **Set up proper authentication**
4. **Configure firewall rules**
5. **Use environment-specific configurations**
6. **Regular security updates**

## 📝 Configuration Examples

### MongoDB Atlas

```env
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=XiansAi
```

### Auth0 Configuration

```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
```

### OpenAI Configuration

```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-your-openai-api-key
LLM_MODEL=gpt-4o-mini
```

## 📚 Documentation

For detailed documentation, see the **[docs/](./docs/)** folder:

- **[Setup Guide](./docs/SETUP.md)** - Environment setup and configuration
- **[Docker Guide](./docs/UNIFIED-COMPOSE.md)** - Unified Docker Compose setup
- **[Technical Details](./docs/DOCKER.md)** - Docker configuration reference
- **[Migration Guide](./docs/MIGRATION.md)** - Upgrade from dual-file setup

## 🆘 Support

For support and questions:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Use the management scripts with `--help` for usage information:
   - `./start.sh --help`
   - `./stop.sh --help` 
   - `./reset.sh --help`
4. Consult the documentation files above for detailed setup information
5. Consult the individual component documentation:
   - [XiansAi Server Documentation](https://github.com/xiansai/server)
   - [XiansAi UI Documentation](https://github.com/xiansai/ui)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 