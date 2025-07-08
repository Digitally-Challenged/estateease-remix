/**
 * Environment configuration helper
 * Validates and provides typed access to environment variables
 */

// @ts-check

interface EnvironmentConfig {
  geminiApiKey: string;
  encryptionKey?: string;
  isDevelopment: boolean;
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * Validates and returns environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!geminiApiKey || geminiApiKey.length === 0 || geminiApiKey === 'your_gemini_api_key_here') {
    throw new EnvironmentError(
      'Gemini API key not configured. Please add your API key to .env.local file.',
    );
  }

  return {
    geminiApiKey,
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY,
    isDevelopment: import.meta.env.DEV,
  };
}

/**
 * Checks if environment is properly configured
 */
export function isEnvironmentConfigured(): boolean {
  try {
    const config = getEnvironmentConfig();
    return !!config.geminiApiKey;
  } catch {
    return false;
  }
}

/**
 * Gets a helpful setup message for missing configuration
 */
export function getSetupInstructions(): string {
  return `
To use EstateEase, you need to configure your Gemini API key:

1. Copy .env.example to .env.local:
   cp .env.example .env.local

2. Get your Gemini API key from:
   https://makersuite.google.com/app/apikey

3. Add your key to .env.local:
   VITE_GEMINI_API_KEY=your_actual_api_key_here

4. Restart the development server

For more help, see the README.md file.
  `.trim();
}
