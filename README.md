# XiansAi Platform - Community Edition

Welcome to the XiansAi Platform Community Edition! This repository provides a simple Docker Compose setup to get you started with the XiansAi platform quickly and easily.

## ⚠️ Important Disclaimer

**This community edition Docker Compose setup is NOT intended for production deployments.** It is designed specifically for local agent development and testing purposes only.

**Why not for production:**

- Uses default/example credentials and secrets
- No proper SSL/TLS certificate configuration
- Missing production-grade security hardening
- Simplified configuration not suitable for production environments
- No unique secrets or certificates in the setup scripts

**For production deployments**, please use proper enterprise-grade configurations with:

- Unique, secure credentials and secrets
- SSL/TLS certificates
- Production-grade security configurations
- Proper environment isolation and access controls

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed on your system
- At least 4GB of available RAM (8GB recommended)
- Internet connection to download the Docker images

**💡 New to the project?** Check out our **[Complete Setup Guide](docs/SETUP_GUIDE.md)** for detailed step-by-step instructions.

### Getting Started

1. **Clone this repository:**

   ```bash
   git clone <repository-url>
   cd community-edition
   ```

2. **Configure your environment:**

   **********
   Set the ***Llm__ApiKey*** in `server/.env.local`
   ```bash
   Llm__ApiKey=your-openai-api-key
   ```
   **********

3. **Start the platform:**

   ```bash
   # Start with defaults (latest version, local environment)
   ./start-all.sh
   
   # Start with specific version
   ./start-all.sh -v v2.0.2
   
   # Start with specific environment
   ./start-all.sh -e production
   
   # Start with specific version and environment
   ./start-all.sh -v v2.0.2 -e staging

   # Show help for all options
   ./start-all.sh --help
   ```

   **Management scripts:**
   - `./start-all.sh [options]` - Start the platform with optional version/environment
   - `./stop-all.sh` - Stop all services (version-independent)  
   - `./reset-all.sh [options]` - Complete reset and cleanup (removes all data)

4. **Access the applications:**

   - **XiansAi UI**: [http://localhost:3001](http://localhost:3001)
   - **XiansAi Server API**: [http://localhost:5001/api-docs](http://localhost:5001/api-docs)
   - **Keycloak Admin Console**: [http://localhost:18080/admin](http://localhost:18080/admin)
   - **Temporal Web UI**: [http://localhost:8080](http://localhost:8080)

## 🔧 Quick Troubleshooting

**Common Issues:**
- **Container conflicts**: `./reset-all.sh -f` then `./start-all.sh`
- **Port conflicts**: Check what's using the port with `lsof -i :PORT`
- **Environment variables**: The project uses `.env.local` files (already included)
- **API key issues**: Set `Llm__ApiKey` in `server/.env.local`

**📖 For detailed troubleshooting:** See our **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)**

## 📋 Configuration

### Script Options

**start-all.sh** supports the following options:

```bash
-v, --version VERSION    Docker image version (default: latest)
-e, --env ENV_POSTFIX    Environment postfix (default: local)
-d, --detached           Run in detached mode (default)
-h, --help               Show help message
```

**reset-all.sh** supports the following options:

```bash
-f, --force              Skip confirmation prompts
-h, --help               Show help message
```

**stop-all.sh** supports:

```bash
-h, --help               Show help message
```

### Examples

```bash
# Development setup (default)
./start-all.sh

# Staging environment with specific version
./start-all.sh -v v2.0.2 -e staging

# Production environment
./start-all.sh -v v2.1.0 -e production

# Stop services (works for any running configuration)
./stop-all.sh

# Complete reset without confirmation prompts
./reset-all.sh -f
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f xiansai-server
docker compose logs -f xiansai-ui
```

#### Primary Platform Repositories

The XiansAi Platform consists of multiple repositories:

- **XiansAi.Server**
  - Docker Hub [99xio/xiansai-server](https://hub.docker.com/repository/docker/99xio/xiansai-server/general)
  - Repository: [XiansAi.Server](https://github.com/XiansAiPlatform/XiansAi.Server)
- **XiansAi.UI**
  - Docker Hub [99xio/xiansai-ui](https://hub.docker.com/repository/docker/99xio/xiansai-ui/general)
  - Repository: [XiansAi.UI](https://github.com/XiansAiPlatform/XiansAi.UI)
- **XiansAi.Lib**
  - NuGet [XiansAi.Lib](https://www.nuget.org/packages/XiansAi.Lib)
  - Repository: [XiansAi.Lib](https://github.com/XiansAiPlatform/XiansAi.Lib)
- **sdk-web-typescript**
  - npm [@99xio/xians-sdk-typescript](https://www.npmjs.com/package/@99xio/xians-sdk-typescript)
  - Repository: [sdk-web-typescript](https://github.com/XiansAiPlatform/sdk-web-typescript)
- **community-edition**
  - Release in this repository [XiansAi Platform Community Edition](https://github.com/XiansAiPlatform/community-edition/releases)

## 📚 Documentation

- **[Agent Development Guide](https://xiansaiplatform.github.io/XiansAi.PublicDocs/)** - Agent development guide
- **[Complete Setup Guide](docs/SETUP_GUIDE.md)** - Comprehensive setup guide for fresh users
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Release Guide](docs/RELEASE_GUIDE.md)** - Complete release process and documentation for maintainers
- **[XiansAi Website](https://xians.ai)** - XiansAi Website

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. See our [Contributing Guide](CONTRIBUTING.md) for detailed instructions.
