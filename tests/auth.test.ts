import assert from 'node:assert/strict';
import test from 'node:test';
import { getVerifiedIdentity } from '../server/auth';
import { getClerkFrontendApiOrigin, getServerConfig } from '../server/config';

const testPublishableKey = `pk_test_${Buffer.from('example.clerk.accounts.dev$').toString('base64')}`;
const livePublishableKey = `pk_live_${Buffer.from('clerk.pawprintsnetwork.com$').toString('base64')}`;

test('rejects an auth object without a user ID', () => {
  assert.equal(getVerifiedIdentity({ userId: null, sessionId: null }), null);
});

test('retains only the verified identity needed by downstream handlers', () => {
  assert.deepEqual(
    getVerifiedIdentity({ userId: 'user_123', sessionId: 'sess_456' }),
    { userId: 'user_123', sessionId: 'sess_456' },
  );
});

test('rejects Clerk development secrets in production', () => {
  assert.throws(
    () => getServerConfig({
      NODE_ENV: 'production',
      CLERK_PUBLISHABLE_KEY: livePublishableKey,
      CLERK_SECRET_KEY: 'sk_test_example',
      DATABASE_URL: 'postgresql://pawprints_app:example@localhost:5432/pawprints',
      GEMINI_API_KEY: 'gemini-example',
      CLERK_AUTHORIZED_PARTIES: 'https://instameow.app',
    }),
    /sk_live_/,
  );
});

test('accepts production credentials and Render port', () => {
  assert.deepEqual(
    getServerConfig({
      NODE_ENV: 'production',
      PORT: '10000',
      CLERK_PUBLISHABLE_KEY: livePublishableKey,
      CLERK_SECRET_KEY: 'sk_live_example',
      DATABASE_URL: 'postgresql://pawprints_app:example@localhost:5432/pawprints',
      GEMINI_API_KEY: 'gemini-example',
      CLERK_AUTHORIZED_PARTIES: 'https://instameow.app,https://instawoof.app',
    }),
    {
      clerkAuthorizedParties: ['https://instameow.app', 'https://instawoof.app'],
      clerkFrontendApiOrigin: 'https://clerk.pawprintsnetwork.com',
      databaseUrl: 'postgresql://pawprints_app:example@localhost:5432/pawprints',
      geminiApiKey: 'gemini-example',
      isProduction: true,
      port: 10000,
    },
  );
});

test('uses safe development defaults when local preview config is missing', () => {
  const config = getServerConfig({
    NODE_ENV: 'development',
  });

  assert.equal(config.clerkFrontendApiOrigin, 'https://example.clerk.accounts.dev');
  assert.equal(config.databaseUrl, 'postgresql://localhost:5432/pawprints');
  assert.equal(config.geminiApiKey, 'dev-gemini-key');
  assert.equal(config.port, 3000);
  assert.deepEqual(config.clerkAuthorizedParties, ['http://localhost:3000']);
});

test('derives Clerk Frontend API origin without exposing a secret', () => {
  assert.equal(
    getClerkFrontendApiOrigin(testPublishableKey),
    'https://example.clerk.accounts.dev',
  );
});
