# Authentication Providers Configuration

This guide explains how to disable username/password authentication and configure federated authentication providers like GitHub in Keycloak.

## Disable Username/Password Authentication

To force users to use only federated providers (like GitHub) and disable local username/password login:

### 1. Update Realm Configuration

In `keycloak/realms/xiansai-realm.json`, modify these settings:

```json
{
  "registrationAllowed": false,
  "resetPasswordAllowed": false,
  "editUsernameAllowed": false,
  "loginWithEmailAllowed": false
}
```

### 2. Remove Default Users (Optional)

Remove the local admin user from the realm configuration:

```json
{
  "users": []
}
```

## Add GitHub Provider

### 1. Create GitHub OAuth App

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. Fill in:
   - **Application name**: `XiansAI Platform`
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: `http://localhost:18080/realms/xiansai/broker/github/endpoint`
3. Save and copy your **Client ID** and **Client Secret**

### 2. Configure GitHub Provider in Realm

Add this to the `identityProviders` array in `keycloak/realms/xiansai-realm.json`:

```json
{
  "identityProviders": [
    {
      "alias": "github",
      "displayName": "GitHub",
      "providerId": "github",
      "enabled": true,
      "updateProfileFirstLoginMode": "on",
      "trustEmail": true,
      "storeToken": false,
      "addReadTokenRoleOnCreate": false,
      "authenticateByDefault": false,
      "linkOnly": false,
      "firstBrokerLoginFlowAlias": "first broker login",
      "config": {
        "clientId": "${GITHUB_CLIENT_ID:-YOUR_GITHUB_CLIENT_ID}",
        "clientSecret": "${GITHUB_CLIENT_SECRET:-YOUR_GITHUB_CLIENT_SECRET}",
        "useJwksUrl": "true"
      }
    }
  ]
}
```

### 3. Set Environment Variables

Create a `.env` file or set environment variables:

```bash
GITHUB_CLIENT_ID=your_actual_client_id
GITHUB_CLIENT_SECRET=your_actual_client_secret
```

### 4. Apply Changes

1. Clear Keycloak database to force fresh import:

   ```bash
   docker exec -it postgresql psql -U temporal -d keycloak -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"
   ```

2. Restart Keycloak:

   ```bash
   cd keycloak
   docker-compose restart keycloak
   ```

## Result

After these changes:

- ✅ Users can only login via GitHub
- ❌ Username/password login is disabled
- ✅ New users are automatically created from GitHub profiles
- ✅ Existing GitHub users can login seamlessly

## Security Note

⚠️ **Never commit OAuth secrets to version control**

- Use environment variables for `clientId` and `clientSecret`
- Add `.env` to your `.gitignore` file
- Rotate secrets regularly in production
