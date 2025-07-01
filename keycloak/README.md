# Keycloak Service

This directory contains the Keycloak identity and access management service for the Flowmaxer community edition.

## Prerequisites

- PostgreSQL service must be running (from `../postgresql`)
- The `xians-community-edition-network` must exist

## Usage

To start the Keycloak service:

```bash
cd keycloak
docker-compose --env-file .env.local up -d
```

To stop the Keycloak service:

```bash
cd keycloak
docker-compose down
```

To view logs:

```bash
cd keycloak
docker-compose logs -f keycloak
```

## Configuration

The Keycloak service is configured with:

### Admin Access
- **Admin Username**: `admin` (configurable via `KEYCLOAK_ADMIN`)
- **Admin Password**: `admin` (configurable via `KEYCLOAK_ADMIN_PASSWORD`)
- **Admin Console URL**: http://localhost:18080/admin

### Database
- **Database Type**: PostgreSQL
- **Database Name**: `keycloak`
- **Database Host**: `postgresql` (container name)
- **Database Port**: `5432`
- **Database User**: `temporal`
- **Database Password**: `temporal`

### Network
- **External Port**: `18080` (configurable via `KEYCLOAK_PORT`)
- **Internal Port**: `8080`
- **Network**: `xians-community-edition-network`

## Features Enabled

- Health checks endpoint: `/health/ready`
- Metrics endpoint (when enabled)
- Development mode (for local development)
- PostgreSQL database backend
- Automatic database initialization

## Database Setup

The Keycloak database is automatically initialized when PostgreSQL starts:

### Automatic Initialization (Default)
- The `init-keycloak-db.sql` script runs automatically when PostgreSQL starts for the first time
- Creates the `keycloak` database and user if they don't exist
- No additional containers or services required

### Manual Initialization (Alternative)
If you need to initialize the database manually, you can use:
```bash
./init-keycloak-db.sh
```

This script:
1. Waits for PostgreSQL to be ready
2. Creates the `keycloak` database if it doesn't exist
3. Creates the `keycloak` user with appropriate permissions

## Environment Variables

You can customize the setup by modifying `.env.local`:

- `KEYCLOAK_VERSION`: Keycloak Docker image version
- `KEYCLOAK_ADMIN`: Admin username
- `KEYCLOAK_ADMIN_PASSWORD`: Admin password
- `KEYCLOAK_PORT`: External port mapping
- `KC_DB_NAME`: Database name for Keycloak
- `ENVIRONMENT_SUFFIX`: Optional suffix for container names

## Development vs Production

This configuration is optimized for development with:
- `start-dev` command (no HTTPS required)
- Relaxed hostname validation
- Health and metrics enabled

For production deployment, you should:
1. Use `start` command instead of `start-dev`
2. Enable HTTPS and proper certificates
3. Set stronger admin credentials
4. Configure proper hostname settings

## Realm Import

The Keycloak service supports automatic realm import during startup:

### Automatic Import
1. Place your realm JSON files in the `realms/` directory
2. Restart Keycloak service to import the realms

**Example realm structure:**
```
keycloak/
├── realms/
│   ├── xianAI-realm.json       # Main application realm
│   └── another-realm.json      # Additional realms
└── docker-compose.yml
```

### Sample Realm
A sample `xianAI-realm.json` is provided with:
- **Realm Name**: `xianAI`
- **Client**: `xiansai-ui` (for frontend integration)
- **Default User**: `admin/admin`
- **Redirect URIs**: Configured for `localhost:3001` and `localhost:3000`

### Custom Realms
To use your own realm:
1. Export your realm from an existing Keycloak instance:
   ```bash
   # From Keycloak admin console: Realm Settings → Action → Partial Export
   # Or via CLI:
   docker exec keycloak /opt/keycloak/bin/kc.sh export --realm your-realm --file /tmp/realm.json
   ```

2. Place the exported JSON file in `keycloak/realms/` directory

3. Restart the Keycloak service:
   ```bash
   docker-compose --env-file .env.local down
   docker-compose --env-file .env.local up -d
   ```

### Notes
- Realms are imported only once during first startup
- Existing realms with the same name won't be overwritten
- For updates, delete the realm via admin console first, then restart

### Alternative: API Import
For importing realms after Keycloak is running, use the API import script:

```bash
# Import default realm (realms/xianAI-realm.json)
./import-realm.sh

# Import specific realm file
./import-realm.sh realms/my-custom-realm.json

# Use with different Keycloak URL
KEYCLOAK_URL=http://keycloak:8080 ./import-realm.sh
```

**API Import Features:**
- ✅ Import realms while Keycloak is running
- ✅ Automatic health check waiting
- ✅ Update existing realms with confirmation
- ✅ Detailed error reporting
- ✅ Configurable via environment variables

## Integration

Other services can integrate with Keycloak by:
1. Configuring OAuth2/OIDC settings to point to `http://keycloak:8080` (internal network)
2. Using `http://localhost:18080` for external access  
3. Using the imported realm (e.g., `xianAI`) for authentication
4. Implementing proper token validation using Keycloak's public keys

## Troubleshooting

1. **Database connection issues**: Ensure PostgreSQL service is running first
2. **Port conflicts**: Change `KEYCLOAK_PORT` in `.env.local` if port 18080 is in use
3. **Memory issues**: Adjust `KEYCLOAK_MEMORY_LIMIT` and `KEYCLOAK_MEMORY_RESERVATION` in `.env.local` 