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

   ```bash
   # For development, create the required environment files:
   cp server/.env.example server/.env.development
   cp ui/.env.example ui/.env.development
   
   # For production, also create production environment files:
   cp server/.env.example server/.env.production
   cp ui/.env.example ui/.env.production
   # Then edit the .env.production files with your production configuration
   ```

3. **Start the platform:**

   ```bash
   # For development (recommended)
   ./start.sh
   
   # For production
   ./start.sh --production
   
   # For production in background
   ./start.sh --production --detached
   
   # Or use Docker Compose directly:
   # Development:
   docker compose --env-file .env.development up -d
   
   # Production:
   docker compose --env-file .env.production up -d
   ```

4. **Access the applications:**

   - **XiansAi UI**: [http://localhost:3001](http://localhost:3001)
   - **XiansAi Server API**: [http://localhost:5001](http://localhost:5001)

## 📋 Configuration

### Environment Files

The platform uses a **unified Docker Compose configuration** with environment-specific settings:

**Docker Compose Configuration:**

- `.env.development` - Docker configuration for development mode
- `.env.production` - Docker configuration for production mode

**Service Configuration:**

- `server/.env.development` - Server configuration for development
- `server/.env.production` - Server configuration for production  
- `ui/.env.development` - UI configuration for development
- `ui/.env.production` - UI configuration for production

This unified approach eliminates duplication while maintaining clear separation between environments.

#### Required Configuration

Before running in production, you **must** configure:

1. **Create production files**: Copy development files and customize them
2. **Database**: Update MongoDB connection in `server/.env.production`
3. **Authentication**: Configure Auth0 settings in both server and UI production files
4. **LLM Provider**: Set up your AI/LLM provider in `server/.env.production`
5. **Email**: Configure email provider in `server/.env.production`

#### Key Configuration Sections

- **Database**: MongoDB connection and database name
- **Authentication**: Auth0 or Azure B2C configuration
- **AI/LLM**: OpenAI or other LLM provider settings
- **Email**: Email service configuration
- **Caching**: Redis or memory cache settings
- **Workflow Engine**: Temporal workflow configuration
- **CORS**: Allowed origins for cross-origin requests

### Development vs Production

The default `.env` file is configured for development with:

- Memory cache instead of Redis
- Console email provider
- Mock LLM provider
- Development CORS settings

For production, update the following:

- Use Redis for caching (`CACHE_PROVIDER=redis`)
- Configure real email provider (`EMAIL_PROVIDER=azure`)
- Configure real LLM provider (`LLM_PROVIDER=openai`)
- Set production CORS origins

## 🏗️ Architecture

The platform consists of three main services:

### MongoDB Database

- **Image**: `mongo:latest`
- **Port**: 27017
- **Purpose**: Document database with replica set configuration

### XiansAi Server

- **Development Image**: `99xio/xiansai-server:latest`
- **Production Image**: `xiansai/server:latest`
- **Port**: 5001 (mapped to container port 80)
- **Technology**: .NET 9.0
- **Purpose**: Backend API and workflow engine

### XiansAi UI

- **Development Image**: `99xio/xiansai-ui:latest`
- **Production Image**: `xiansai/ui:latest`
- **Port**: 3001 (mapped to container port 80)
- **Technology**: React
- **Purpose**: Web-based user interface

All services are connected via environment-specific Docker networks and use separate volumes for data persistence.

## 🔧 Management Commands

### Start the platform

```bash
# Development (recommended)
./start.sh

# Production
./start.sh --production

# Production in background
./start.sh --production --detached

# Direct Docker Compose usage:
# Development
docker compose --env-file .env.development up -d

# Production
docker compose --env-file .env.production up -d
```

### Stop the platform

```bash
# Development
docker compose --env-file .env.development down

# Production
docker compose --env-file .env.production down
```

### View logs

```bash
# Development - all services
docker compose --env-file .env.development logs -f

# Production - all services
docker compose --env-file .env.production logs -f

# Specific service (development)
docker compose --env-file .env.development logs -f xiansai-server
docker compose --env-file .env.development logs -f xiansai-ui

# Specific service (production)
docker compose --env-file .env.production logs -f xiansai-server
docker compose --env-file .env.production logs -f xiansai-ui
```

### Update to latest versions

```bash
# Development
docker compose --env-file .env.development pull
docker compose --env-file .env.development up -d

# Production
docker compose --env-file .env.production pull
docker compose --env-file .env.production up -d
```

### Restart a specific service

```bash
# Development
docker compose --env-file .env.development restart xiansai-server
docker compose --env-file .env.development restart xiansai-ui

# Production
docker compose --env-file .env.production restart xiansai-server
docker compose --env-file .env.production restart xiansai-ui
```

## Complete reset (will lose all data)

```bash
# Development
docker compose --env-file .env.development down
docker volume rm xians-mongodb-data
docker compose --env-file .env.development up -d

# Production  
docker compose --env-file .env.production down
docker volume rm xians-mongodb-data-prod
docker compose --env-file .env.production up -d
```

MongoDB will be automatically initialized with a fresh database

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

### Logs and Debugging

View detailed logs for troubleshooting:

```bash
# Development - view server logs
docker compose --env-file .env.development logs xiansai-server

# Development - view UI logs
docker compose --env-file .env.development logs xiansai-ui

# Development - follow logs in real-time
docker compose --env-file .env.development logs -f

# Production - view server logs
docker compose --env-file .env.production logs xiansai-server

# Production - view UI logs  
docker compose --env-file .env.production logs xiansai-ui

# Production - follow logs in real-time
docker compose --env-file .env.production logs -f
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
3. Consult the documentation files above for detailed setup information
4. Consult the individual component documentation:
   - [XiansAi Server Documentation](https://github.com/xiansai/server)
   - [XiansAi UI Documentation](https://github.com/xiansai/ui)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 