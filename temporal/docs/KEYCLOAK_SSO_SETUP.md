# Temporal UI Keycloak SSO Configuration

This document describes how to configure Temporal UI to use Keycloak SSO authentication.

## Overview

The Temporal UI has been configured to authenticate users through Keycloak using OpenID Connect (OIDC). This integration provides centralized authentication for the XiansAI platform.

## Configuration Details

### Keycloak Client Configuration

A new client `temporal-ui` has been added to the `xiansai` realm with the following settings:

- **Client ID**: `temporal-ui`
- **Client Secret**: `temporal-ui-secret-key-12345`
- **Root URL**: `http://localhost:8080`
- **Redirect URIs**: 
  - `http://localhost:8080/auth/sso/callback`
  - `http://localhost:8080/*`
- **Web Origins**: `http://localhost:8080`
- **Access Type**: Confidential (not public)
- **Standard Flow**: Enabled
- **Direct Access Grants**: Enabled

### Temporal UI Environment Variables

The following environment variables have been configured for SSO:

```yaml
environment:
  - TEMPORAL_GRPC_ENDPOINT=temporal:7233
  - TEMPORAL_ADDRESS=temporal:7233
  - TEMPORAL_CORS_ORIGINS=http://localhost:3000
  - TEMPORAL_AUTH_ENABLED=true
  - TEMPORAL_AUTH_PROVIDER_URL=http://keycloak:9080/realms/xiansai
  - TEMPORAL_AUTH_CLIENT_ID=temporal-ui
  - TEMPORAL_AUTH_CLIENT_SECRET=temporal-ui-secret-key-12345
  - TEMPORAL_AUTH_CALLBACK_URL=http://localhost:8080/auth/sso/callback
  - TEMPORAL_AUTH_SCOPES=openid,profile,email
```

## Setup Instructions

### 1. Add Hosts Entry

Add this line to your `/etc/hosts` file to allow browsers to resolve `keycloak`:

```bash
echo "127.0.0.1   keycloak" | sudo tee -a /etc/hosts
```

**Or edit manually:**
```bash
sudo nano /etc/hosts
# Add this line:
# 127.0.0.1   keycloak
```

### 2. Start Required Services

Ensure all required services are running in the correct order:

```bash
# 1. Start PostgreSQL first (required by both Keycloak and Temporal)
cd postgresql
docker-compose --env-file .env.local up -d

# 2. Start Keycloak (requires PostgreSQL)
cd ../keycloak
docker-compose --env-file .env.local up -d

# 3. Start Temporal services (requires PostgreSQL)
cd ../temporal
docker-compose --env-file .env.local up -d
```

### 2. Verify Services

Check that all services are healthy:

```bash
# Check Keycloak
curl -f http://localhost:9080/health/ready

# Check Temporal UI
curl -f http://localhost:8080

# Check network connectivity between services
docker exec temporal-ui ping -c 1 keycloak
```

### 3. Access Temporal UI

1. Navigate to http://localhost:8080
2. You should be redirected to Keycloak login page
3. Login with the default admin credentials:
   - **Username**: `admin`
   - **Password**: `admin123` (or the password set in your `.env` file)
4. After successful authentication, you'll be redirected back to Temporal UI

## Network Configuration

Both services use the `xians-community-edition-network`, enabling:
- Internal service-to-service communication using container names as hostnames
- **Important**: Browser redirects use `http://localhost:9080` (external URL) while internal API calls can use `http://keycloak:9080`

## Troubleshooting

### Common Issues

1. **Authentication redirects to wrong URL**
   - Verify `TEMPORAL_AUTH_CALLBACK_URL` matches the redirect URI in Keycloak client
   - Check that ports are correctly mapped

2. **Cannot reach Keycloak**
   - Ensure both services are on the same Docker network
   - Verify Keycloak is healthy: `docker exec keycloak curl -f http://localhost:9080/health/ready`

3. **Token validation errors**
   - Verify client secret matches between Temporal UI config and Keycloak client
   - Check that the realm name is correct in `TEMPORAL_AUTH_PROVIDER_URL`

### Debug Commands

```bash
# View Temporal UI logs
docker logs temporal-ui -f

# View Keycloak logs
docker logs keycloak -f

# Test network connectivity
docker exec temporal-ui nslookup keycloak
docker exec temporal-ui curl -v http://keycloak:9080/realms/xiansai/.well-known/openid_configuration
```

## Security Architecture

### Current Security Setup

This configuration provides **UI-level security** with Keycloak SSO integration:

1. **✅ Temporal UI Authentication**: Users must authenticate through Keycloak to access the Temporal UI
2. **✅ JWT Token Integration**: Temporal UI receives and validates JWT tokens from Keycloak
3. **✅ Role-based Access**: JWT tokens include permissions claims for authorization
4. **⚠️ Development Mode**: Temporal Server APIs are not protected for development convenience

### Security Layers

#### Layer 1: UI Authentication (Implemented)
- **Temporal UI** requires Keycloak authentication
- Users are redirected to Keycloak login page
- JWT tokens contain user permissions and roles
- Session management through Keycloak

#### Layer 2: API Protection (Optional for Production)
For production deployments, you can enable full API protection by:

1. **Enable Temporal Server JWT Authentication**:
   ```yaml
   environment:
     - TEMPORAL_AUTH_ENABLED=true
     - TEMPORAL_AUTH_AUTHORIZER=default
     - TEMPORAL_AUTH_CLAIM_MAPPER=default
     - TEMPORAL_JWT_KEY_SOURCE1=http://keycloak:9080/realms/xiansai/protocol/openid-connect/certs
     - TEMPORAL_JWT_PERMISSIONS_CLAIM=permissions
   ```

2. **Configure System Authentication**: Set up service accounts for internal Temporal operations

### JWT Token Structure

The Keycloak JWT tokens include a `permissions` claim with Temporal-specific permissions:
```json
{
  "permissions": [
    "temporal-system:admin",
    "default:admin"
  ],
  "sub": "admin",
  "email": "admin@xiansai.local"
}
```

## Security Considerations

1. **Client Secret**: Change the default client secret `temporal-ui-secret-key-12345` to a secure random value
2. **HTTPS**: For production deployments, configure HTTPS for both Keycloak and Temporal UI
3. **Network Security**: Consider using internal networks for service-to-service communication
4. **User Management**: Configure appropriate user roles and permissions in Keycloak
5. **API Protection**: For production, enable full Temporal Server API authentication
6. **Token Validation**: Temporal UI validates JWT tokens but Temporal Server APIs are open in development mode

## Customization

### Changing Client Secret

1. Update the client secret in Keycloak admin console
2. Update `TEMPORAL_AUTH_CLIENT_SECRET` in the Temporal docker-compose.yml
3. Restart Temporal UI service

### Adding Additional Scopes

Modify `TEMPORAL_AUTH_SCOPES` to include additional OpenID Connect scopes as needed:

```yaml
- TEMPORAL_AUTH_SCOPES=openid profile email roles groups
```

### Custom Realm

To use a different Keycloak realm:

1. Create or import your custom realm
2. Update `TEMPORAL_AUTH_PROVIDER_URL` to point to your realm
3. Ensure the client exists in the target realm
