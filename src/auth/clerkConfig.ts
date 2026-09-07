import type { ClerkProviderProps } from '@clerk/clerk-react';

type PublicClerkConfig = Omit<ClerkProviderProps, 'children'>;

function parseDomains(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((domain) => domain.trim())
    .filter(Boolean)
    .map(normalizeDomain);
}

function normalizeDomain(value: string): string {
  const hostname = value.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];

  if (!hostname || /[^a-z0-9.-]/.test(hostname)) {
    throw new Error(`Invalid Clerk domain: ${value}`);
  }

  return hostname;
}

export function createClerkConfig(
  env: ImportMetaEnv,
  currentUrl: URL,
): PublicClerkConfig {
  const publishableKey = env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY.');
  }

  if (env.PROD && env.VITE_ALLOW_CLERK_TEST_KEYS !== 'true' && !publishableKey.startsWith('pk_live_')) {
    throw new Error(
      'Production builds require a Clerk production publishable key (pk_live_...).',
    );
  }

  const primaryDomain = normalizeDomain(env.VITE_CLERK_PRIMARY_DOMAIN || currentUrl.hostname);
  const satelliteDomains = parseDomains(env.VITE_CLERK_SATELLITE_DOMAINS);
  const productionOrigins = env.PROD
    ? [`https://${primaryDomain}`, ...satelliteDomains.map((domain) => `https://${domain}`)]
    : [];
  const allowedOrigins = Array.from(new Set([currentUrl.origin, ...productionOrigins]));
  const signInUrl = env.VITE_CLERK_SIGN_IN_URL || `https://${primaryDomain}/app`;
  const signUpUrl = env.VITE_CLERK_SIGN_UP_URL || signInUrl;

  if (satelliteDomains.length === 0) {
    return {
      publishableKey,
      afterSignOutUrl: '/',
      allowedRedirectOrigins: allowedOrigins,
    };
  }

  return {
    publishableKey,
    afterSignOutUrl: '/',
    allowedRedirectOrigins: allowedOrigins,
    isSatellite: (url) => satelliteDomains.includes(url.hostname.toLowerCase()),
    domain: (url) => normalizeDomain(url.hostname),
    signInUrl,
    signUpUrl,
  };
}
