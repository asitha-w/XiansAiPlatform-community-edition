# Environment Setup Guide

## 🔧 Setting Up Environment Files

The XiansAi Platform requires environment configuration files that are not included in the repository for security reasons. Follow these steps to set up your environment:

### Quick Setup

1. **Copy the example files:**
   ```bash
   # Service environment files
   # For development
   cp server/.env.example server/.env.development
   cp ui/.env.example ui/.env.development
   
   # For production
   cp server/.env.example server/.env.production
   cp ui/.env.example ui/.env.production
   ```

2. **Docker Compose configuration (if missing):**
   The repository should already include `.env.development` and `.env.production` files for Docker Compose configuration. If they're missing, they control:
   - Docker image selection (development vs production images)
   - Resource limits and logging configuration
   - Container naming and network configuration

3. **Edit the files with your actual values:**
   - Replace all placeholder values (e.g., `your-api-key-here`) with your real credentials
   - Configure database connections, API keys, and authentication settings

### Required Configuration

#### Server Configuration (`server/.env.development` or `server/.env.production`)

**Database:**
- `MongoDB__ConnectionString` - Your MongoDB connection string
- `MongoDB__DatabaseName` - Your database name

**AI/LLM:**
- `Llm__ApiKey` - Your OpenAI API key
- `Llm__Model` - AI model to use (e.g., `gpt-4o-mini`)

**Authentication (choose one):**

*Auth0:*
- `Auth0__Domain` - Your Auth0 domain
- `Auth0__ClientId` - Your Auth0 client ID
- `Auth0__ClientSecret` - Your Auth0 client secret

*Azure B2C:*
- `AzureB2C__TenantId` - Your Azure tenant ID
- `AzureB2C__ClientId` - Your Azure client ID
- `AzureB2C__ClientSecret` - Your Azure client secret

#### UI Configuration (`ui/.env.development` or `ui/.env.production`)

- `REACT_APP_API_URL` - URL of your XiansAi server (e.g., `http://localhost:5000`)
- `REACT_APP_AUTH_PROVIDER` - Either `auth0` or `entraId`
- `REACT_APP_AUTH0_DOMAIN` - Your Auth0 domain (if using Auth0)
- `REACT_APP_AUTH0_CLIENT_ID` - Your Auth0 client ID (if using Auth0)

### Development vs Production

**Development defaults:**
- Uses memory cache instead of Redis
- Console email provider (emails logged to console)
- Debug logging enabled
- CORS allows localhost origins

**Production recommendations:**
- Use Redis for caching (`Cache__Provider=redis`)
- Use real email provider (`Email__Provider=azure`)
- Set production CORS origins
- Use secure database connections

### Security Notes

⚠️ **Never commit actual environment files to git!**

- Environment files contain sensitive credentials
- They are automatically ignored by `.gitignore`
- Always use the `.env.example` files as templates
- Rotate any exposed credentials immediately

## 🐳 Docker Compose Environment Files

The platform now uses a **unified Docker Compose configuration** with environment-specific files:

### Docker Configuration Files
- **`.env.development`**: Controls development Docker setup
- **`.env.production`**: Controls production Docker setup

### Key Settings Controlled
- **Images**: Development uses `99xio/*` images, production uses `xiansai/*` images
- **Resource limits**: Development optimized for local development, production for server deployment
- **Logging**: Development uses local driver, production uses JSON with rotation
- **Container naming**: Environment suffixes prevent conflicts

### Starting the Platform
```bash
# Development (uses .env.development)
./start.sh

# Production (uses .env.production)  
./start.sh --production

# Pull latest images before starting
./pull.sh -e development
./pull.sh -e production

# Direct Docker Compose usage
docker compose --env-file .env.development up -d
docker compose --env-file .env.production up -d
```

### Updating Images

To pull the latest Docker images:

```bash
# Pull latest server and UI images
./pull.sh

# Pull for specific environment
./pull.sh -e production

# Pull only specific components
./pull.sh --server    # Server only
./pull.sh --ui        # UI only
./pull.sh --all       # All images including dependencies

# Then restart the platform
./stop.sh && ./start.sh
```

The `pull.sh` script safely extracts image names from your environment files and pulls the appropriate versions for your configuration.

### Support

If you need help with configuration:
1. Check the example files for expected formats
2. Refer to the main README.md for service-specific configuration
3. Review docs/UNIFIED-COMPOSE.md for Docker Compose details
4. Review the troubleshooting section for common issues 