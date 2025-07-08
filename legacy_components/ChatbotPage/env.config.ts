/**
 * Environment Configuration for EstateEase
 * Centralized configuration management with type safety and validation
 */

interface EnvConfig {
  app: AppConfig;
  auth: AuthConfig;
  api: ApiConfig;
  security: SecurityConfig;
  features: FeatureFlags;
  monitoring: MonitoringConfig;
  development: DevelopmentConfig;
}

interface AppConfig {
  name: string;
  version: string;
  url: string;
  environment: 'development' | 'staging' | 'production';
}

interface AuthConfig {
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  geminiApiKey?: string;
}

interface SecurityConfig {
  cspEnabled: boolean;
  hstsEnabled: boolean;
  uploadMaxSize: number;
  allowedFileTypes: string[];
}

interface FeatureFlags {
  multiUser: boolean;
  advancedReports: boolean;
  aiAssistant: boolean;
  performanceMonitoring: boolean;
}

interface MonitoringConfig {
  sentryDsn?: string;
  googleAnalyticsId?: string;
  hotjarId?: string;
}

interface DevelopmentConfig {
  showDevTools: boolean;
  mockApi: boolean;
}

/**
 * Helper function to safely get environment variables with defaults
 */
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return defaultValue;
};

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key).toLowerCase();
  return value === 'true' || value === '1';
};

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Main environment configuration
 */
export const ENV_CONFIG: EnvConfig = {
  app: {
    name: getEnvVar('VITE_APP_NAME', 'EstateEase'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    url: getEnvVar('VITE_APP_URL', 'http://localhost:5173'),
    environment: getEnvVar('NODE_ENV', 'development') as any,
  },

  auth: {
    jwtSecret: getEnvVar('JWT_SECRET', 'default-secret-key-change-in-production'),
    jwtIssuer: getEnvVar('JWT_ISSUER', 'estateease'),
    jwtAudience: getEnvVar('JWT_AUDIENCE', 'estateease-users'),
    accessTokenExpiry: getEnvVar('ACCESS_TOKEN_EXPIRY', '15m'),
    refreshTokenExpiry: getEnvVar('REFRESH_TOKEN_EXPIRY', '7d'),
  },

  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'),
    timeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000),
    geminiApiKey: getEnvVar('GEMINI_API_KEY'),
  },

  security: {
    cspEnabled: getBooleanEnvVar('VITE_CSP_ENABLED', true),
    hstsEnabled: getBooleanEnvVar('VITE_HSTS_ENABLED', true),
    uploadMaxSize: getNumberEnvVar('VITE_UPLOAD_MAX_SIZE', 10485760), // 10MB
    allowedFileTypes: getEnvVar('VITE_ALLOWED_FILE_TYPES', 'pdf,doc,docx,jpg,jpeg,png').split(','),
  },

  features: {
    multiUser: getBooleanEnvVar('VITE_FEATURE_MULTI_USER', false),
    advancedReports: getBooleanEnvVar('VITE_FEATURE_ADVANCED_REPORTS', true),
    aiAssistant: getBooleanEnvVar('VITE_FEATURE_AI_ASSISTANT', true),
    performanceMonitoring: getBooleanEnvVar('VITE_PERFORMANCE_MONITORING', true),
  },

  monitoring: {
    sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
    googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
    hotjarId: getEnvVar('VITE_HOTJAR_ID'),
  },

  development: {
    showDevTools: getBooleanEnvVar('VITE_SHOW_DEV_TOOLS', true),
    mockApi: getBooleanEnvVar('VITE_MOCK_API', true),
  },
};

/**
 * Configuration validation
 */
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate required production settings
  if (ENV_CONFIG.app.environment === 'production') {
    if (ENV_CONFIG.auth.jwtSecret === 'default-secret-key-change-in-production') {
      errors.push('JWT_SECRET must be set to a secure value in production');
    }

    if (ENV_CONFIG.auth.jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }

    if (!ENV_CONFIG.api.geminiApiKey && ENV_CONFIG.features.aiAssistant) {
      errors.push('GEMINI_API_KEY is required when AI assistant feature is enabled');
    }
  }

  // Validate file upload settings
  if (ENV_CONFIG.security.uploadMaxSize > 50 * 1024 * 1024) {
    // 50MB
    errors.push('Upload max size should not exceed 50MB for security reasons');
  }

  // Validate URLs
  try {
    new URL(ENV_CONFIG.app.url);
    new URL(ENV_CONFIG.api.baseUrl);
  } catch (error) {
    errors.push('Invalid URL configuration detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Helper functions for feature checking
 */
export const isProduction = (): boolean => ENV_CONFIG.app.environment === 'production';
export const isDevelopment = (): boolean => ENV_CONFIG.app.environment === 'development';
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean =>
  ENV_CONFIG.features[feature];

/**
 * Security utilities
 */
export const getSecurityHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};

  if (ENV_CONFIG.security.cspEnabled) {
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
    ].join('; ');
  }

  if (ENV_CONFIG.security.hstsEnabled && isProduction()) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
};

/**
 * Development utilities
 */
export const getDevConfig = () => ({
  showDevTools: ENV_CONFIG.development.showDevTools && isDevelopment(),
  mockApi: ENV_CONFIG.development.mockApi,
  logLevel: isDevelopment() ? 'debug' : 'error',
});

/**
 * Export commonly used configurations
 */
export const {
  app: APP_CONFIG,
  auth: AUTH_CONFIG,
  api: API_CONFIG,
  security: SECURITY_CONFIG,
  features: FEATURE_FLAGS,
  monitoring: MONITORING_CONFIG,
} = ENV_CONFIG;

export default ENV_CONFIG;
