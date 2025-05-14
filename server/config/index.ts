// Server configuration

// Environment variables with defaults
export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Admin credentials (for development only)
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'password123',

  // Security
  sessionSecret: process.env.SESSION_SECRET || 'royal-fc-session-secret',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Paths
  publicPath: process.env.PUBLIC_PATH || 'dist/public',

  // Feature flags
  useInMemoryStorage: process.env.USE_IN_MEMORY_STORAGE === 'true' || !process.env.DATABASE_URL,

  // Validate required configuration
  validateConfig() {
    // For now, we don't have any required environment variables
    // This function is a placeholder for future validation
    return true;
  }
};

// Export default config
export default config;
