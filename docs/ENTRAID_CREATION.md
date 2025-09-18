# Creating the Entra App for Azure B2C Integration

This guide walks you through creating an Azure Entra ID app registration for Azure B2C integration with XiansAI.

## Step 1: Create An App

1. **App Registration**
   - Create an app in Azure Portal
   - **Name**: `xiansai-app-integrator` (or your preferred name)
   - **Supported account types**: Single Tenant
   - **Redirect URI**: 
     - Select **Single page Application**
     - Set URL to: `https://app-url/callback`
   - Click **Register**

## Step 2: Expose the API in the App

1. In your app registration:
   - Go to **Expose an API**
   - Click **Set** next to **Application ID URI** → accept the default or customize
   - Click **+ Add a scope**

2. **Configure the scope**:
   - **Scope name**: `user_impersonation`
   - **Who can consent**: **Admins and users**
   - **Admin consent display name**: `Access XiansAI`
   - **Admin consent description**: `Allow the application to access XiansAI on your behalf.`
   - **State**: Enabled
   - Click **Add scope**

## Step 3: Grant Access to the App

1. In your app registration:
   - Go to **API permissions**
   - Click **+ Add a permission**
   - Choose **My APIs**
   - Select the app you created in Step 1
   - Choose **Delegated permissions**
   - Select the **`user_impersonation`** scope you just defined
   - Click **Add permission**

## Next Steps

After completing these steps, you'll have:

- ✅ An Entra ID app registration
- ✅ Exposed API with user impersonation scope
- ✅ Proper permissions configured

You can now use this app registration for Azure B2C integration with your XiansAI platform.
