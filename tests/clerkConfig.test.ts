import assert from 'node:assert/strict';
import test from 'node:test';
import { createClerkConfig } from '../src/auth/clerkConfig';

const developmentKey = 'pk_test_example';
const productionKey = 'pk_live_example';

function environment(overrides: Partial<ImportMetaEnv> = {}): ImportMetaEnv {
  return {
    BASE_URL: '/',
    DEV: true,
    MODE: 'development',
    PROD: false,
    SSR: false,
    VITE_CLERK_PUBLISHABLE_KEY: developmentKey,
    ...overrides,
  };
}

test('keeps the exact local origin in the redirect allowlist', () => {
  const config = createClerkConfig(
    environment(),
    new URL('http://localhost:3000/app'),
  );

  assert.deepEqual(config.allowedRedirectOrigins, [
    'http://localhost:3000',
  ]);
  assert.equal('isSatellite' in config, false);
});

test('normalizes configured domains to hostnames', () => {
  const config = createClerkConfig(
    environment({
      DEV: false,
      PROD: true,
      MODE: 'production',
      VITE_CLERK_PUBLISHABLE_KEY: productionKey,
      VITE_CLERK_PRIMARY_DOMAIN: 'https://instameow.app/an-accidental-path',
      VITE_CLERK_SATELLITE_DOMAINS: 'https://instawoof.app/app',
    }),
    new URL('https://instameow.app/app'),
  );

  assert.deepEqual(config.allowedRedirectOrigins, [
    'https://instameow.app',
    'https://instawoof.app',
  ]);
});

test('rejects development Clerk keys in production', () => {
  assert.throws(
    () => createClerkConfig(
      environment({ DEV: false, PROD: true, MODE: 'production' }),
      new URL('https://instameow.app/app'),
    ),
    /pk_live_/,
  );
});

test('configures both brand domains as satellites of Pawprint Network', () => {
  const config = createClerkConfig(
    environment({
      DEV: false,
      PROD: true,
      MODE: 'production',
      VITE_CLERK_PUBLISHABLE_KEY: productionKey,
      VITE_CLERK_PRIMARY_DOMAIN: 'pawprintsnetwork.com',
      VITE_CLERK_SATELLITE_DOMAINS: 'instameow.app,www.instameow.app,instawoof.app,www.instawoof.app',
      VITE_CLERK_SIGN_IN_URL: 'https://pawprintsnetwork.com/app',
    }),
    new URL('https://instawoof.app/app'),
  );

  assert.equal(typeof config.isSatellite, 'function');
  assert.equal(
    typeof config.isSatellite === 'function'
      ? config.isSatellite(new URL('https://instawoof.app/app'))
      : config.isSatellite,
    true,
  );
  assert.equal(config.signInUrl, 'https://pawprintsnetwork.com/app');
});
