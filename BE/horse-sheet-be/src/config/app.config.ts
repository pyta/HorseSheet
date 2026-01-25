export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
}

export const getAppConfig = (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  // Default to localhost:5173 for development, require explicit config for production
  const defaultCorsOrigin = nodeEnv === 'development' ? 'http://localhost:5173' : undefined;
  
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv,
    corsOrigin: process.env.CORS_ORIGIN || defaultCorsOrigin || '*',
  };
};
