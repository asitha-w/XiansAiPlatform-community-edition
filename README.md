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
   # For development, the .env.development files are already included
   # For production, create production environment files:
   cp server/.env.development server/.env.production
   cp ui/.env.development ui/.env.production
   # Then edit the .env.production files with your production configuration
   ```

3. **Start the platform:**

   ```bash
   docker-compose up -d
   ```

4. **Access the applications:**

   - **XiansAi UI**: [http://localhost:3000](http://localhost:3000)
   - **XiansAi Server API**: [http://localhost:5000](http://localhost:5000)

## 📋 Configuration

### Environment Variables

The platform uses individual environment files for each service:

- `server/.env.development` - Server configuration for development
- `server/.env.production` - Server configuration for production  
- `ui/.env.development` - UI configuration for development
- `ui/.env.production` - UI configuration for production

This approach eliminates duplication and keeps configurations close to their respective services.

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

The platform consists of two main services:

### XiansAi Server

- **Image**: `xiansai/server:latest`
- **Port**: 5000 (mapped to container port 8080)
- **Technology**: .NET 9.0
- **Purpose**: Backend API and workflow engine

### XiansAi UI

- **Image**: `xiansai/ui:latest`
- **Port**: 3000 (mapped to container port 80)
- **Technology**: React
- **Purpose**: Web-based user interface

Both services are connected via the `xians-network` Docker network and grouped under the `xians` namespace.

## 🔧 Management Commands

### Start the platform

```bash
docker-compose up -d
```

### Stop the platform

```bash
docker-compose down
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f xiansai-server
docker-compose logs -f xiansai-ui
```

### Update to latest versions

```bash
docker-compose pull
docker-compose up -d
```

### Restart a specific service

```bash
docker-compose restart xiansai-server
docker-compose restart xiansai-ui
```

## 🔍 Troubleshooting

### Health Checks

Both services include health checks:

- Server health check: `http://localhost:5000/health`
- UI health check: `http://localhost:3000`

### Common Issues

1. **Services won't start**: Check that ports 3000 and 5000 are not in use
2. **Database connection issues**: Verify MongoDB connection string
3. **Authentication errors**: Check Auth0 configuration
4. **CORS errors**: Verify allowed origins in configuration

### Logs and Debugging

View detailed logs for troubleshooting:

```bash
# View server logs
docker-compose logs xiansai-server

# View UI logs
docker-compose logs xiansai-ui

# Follow logs in real-time
docker-compose logs -f
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

## 🆘 Support

For support and questions:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Consult the individual component documentation:
   - [XiansAi Server Documentation](https://github.com/xiansai/server)
   - [XiansAi UI Documentation](https://github.com/xiansai/ui)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 