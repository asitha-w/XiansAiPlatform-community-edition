// Socket SDK Configuration
export interface SDKConfig {
  tenantId: string;
  apiKey: string;
  serverUrl: string;
  participantId: string;
}

// TODO: Replace these with your actual configuration values
export const sdkConfig: SDKConfig = {
  tenantId: 'your-tenant-id',
  apiKey: 'sk-your-api-key', 
  serverUrl: 'https://api.yourdomain.com',
  participantId: 'default-participant'
};

// Environment-based configuration
export const getSDKConfig = (): SDKConfig => {
  return {
    tenantId: import.meta.env.VITE_XIANSAI_TENANT_ID || sdkConfig.tenantId,
    apiKey: import.meta.env.VITE_XIANSAI_API_KEY || sdkConfig.apiKey,
    serverUrl: import.meta.env.VITE_XIANSAI_SERVER_URL || sdkConfig.serverUrl,
    participantId: import.meta.env.VITE_XIANSAI_PARTICIPANT_ID || sdkConfig.participantId,
  };
};