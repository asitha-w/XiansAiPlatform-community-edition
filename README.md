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
- At least 4GB of available RAM
- Internet connection to download the Docker images

### Getting Started

1. **Clone this repository:**

   ```bash
   git clone <repository-url>
   cd community-edition
   ```

2. **Configure your environment:**

   The platform uses version files (`.config.*`) to manage environment configuration and Docker image versions. These files contain:
   - Docker image versions for server and UI
   - Environment postfix settings
   - Compose project name

   Example config files:
   - `.config.v2.1.0-beta` (default)
   - `.config.my.v2.1.0-beta` (custom environment)

   **********
   ***Llm__ApiKey must be set in server/.env.local***
   Llm__ApiKey=your-openai-api-key
   **********

3. **Start the platform:**

   ```bash
   # Start with default version (.config.v2.1.0-beta)
   ./start-all.sh
   
   # Or specify a different version file
   ./start-all.sh -v my.v2.1.0-beta  # Uses .config.my.v2.1.0-beta
   ./start-all.sh -v v2.0.0          # Uses .config.v2.0.0

   # Show help for more options
   ./start-all.sh --help
   ```

   **Management scripts:**
   - `./start-all.sh` - Start the platform
   - `./stop-all.sh` - Stop the platform  
   - `./reset-all.sh` - Complete reset (removes all data)

4. **Access the applications:**

   - **XiansAi UI**: [http://localhost:3001](http://localhost:3001)
   - **XiansAi Server API**: [http://localhost:5001/api-docs](http://localhost:5001/api-docs)
   - **Keycloak Admin Console**: [http://localhost:18080/admin](http://localhost:18080/admin)
   - **Temporal Web UI**: [http://localhost:8080](http://localhost:8080)

## 📋 Configuration

### View logs

```bash
# All services
./logs-all.sh

# Specific service
./logs-all.sh xiansai-server

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f xiansai-server
docker compose logs -f xiansai-ui
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 