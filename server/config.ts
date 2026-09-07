export interface ServerConfig {
  clerkAuthorizedParties: string[];
  clerkFrontendApiOrigin: string;
  databaseUrl: string;
  geminiApiKey: string;
  isProduction: boolean;
  port: number;
}

function parseOrigins(value: string | undefined, isProduction: boolean): string[] {
  const origins = (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => new URL(origin).origin);

  if (isProduction && origins.length === 0) {
    throw new Error('CLERK_AUTHORIZED_PARTIES must list the trusted production origins.');
  }

  if (isProduction && origins.some((origin) => !origin.startsWith('https://'))) {
    throw new Error('Production Clerk authorized parties must use HTTPS.');
  }

  return Array.from(new Set(origins));
}

export function getClerkFrontendApiOrigin(publishableKey: string): string {
  const encoded = publishableKey.replace(/^pk_(test|live)_/, '');
  const frontendApi = Buffer.from(encoded, 'base64').toString('utf8').replace(/\$$/, '');

  if (!frontendApi || !frontendApi.includes('.')) {
    throw new Error('CLERK_PUBLISHABLE_KEY is malformed.');
  }

  return new URL(`https://${frontendApi}`).origin;
}

export function getServerConfig(env: NodeJS.ProcessEnv): ServerConfig {
  const isProduction = env.NODE_ENV === 'production';
  const defaultDevPublishableKey = `pk_test_${Buffer.from('example.clerk.accounts.dev$').toString('base64')}`;
  const defaultDevSecretKey = 'sk_test_dev_key';
  const defaultDevDatabaseUrl = 'postgresql://localhost:5432/pawprints';
  const defaultDevGeminiKey = 'dev-gemini-key';
  const clerkPublishableKey = env.CLERK_PUBLISHABLE_KEY || (isProduction ? '' : defaultDevPublishableKey);
  const clerkSecretKey = env.CLERK_SECRET_KEY || (isProduction ? '' : defaultDevSecretKey);
  const databaseUrl = env.DATABASE_URL || (isProduction ? '' : defaultDevDatabaseUrl);
  const geminiApiKey = env.GEMINI_API_KEY || (isProduction ? '' : defaultDevGeminiKey);
  const port = Number.parseInt(env.PORT || '3000', 10);

  if (!clerkPublishableKey.startsWith('pk_')) {
    throw new Error('CLERK_PUBLISHABLE_KEY is missing or malformed.');
  }

  if (!clerkSecretKey.startsWith('sk_')) {
    throw new Error('CLERK_SECRET_KEY is missing or malformed.');
  }

  if (
    isProduction
    && env.ALLOW_CLERK_TEST_KEYS !== 'true'
    && !clerkSecretKey.startsWith('sk_live_')
  ) {
    throw new Error('Production requires a Clerk secret key beginning with sk_live_.');
  }

  if (
    isProduction
    && env.ALLOW_CLERK_TEST_KEYS !== 'true'
    && !clerkPublishableKey.startsWith('pk_live_')
  ) {
    throw new Error('Production requires a Clerk publishable key beginning with pk_live_.');
  }

  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is required.');
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required.');
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL.');
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return {
    clerkAuthorizedParties: parseOrigins(
      env.CLERK_AUTHORIZED_PARTIES || (isProduction ? '' : 'http://localhost:3000'),
      isProduction,
    ),
    clerkFrontendApiOrigin: getClerkFrontendApiOrigin(clerkPublishableKey),
    databaseUrl,
    geminiApiKey,
    isProduction,
    port,
  };
}
