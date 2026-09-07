import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiRequestError, authenticatedApiRequest } from '../src/auth/useAuthenticatedApi';

test('adds a bearer token and keeps API requests same-origin', async () => {
  const fetchMock: typeof fetch = async (input, init) => {
    assert.equal(input, '/api/example');
    assert.equal(init?.credentials, 'same-origin');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer session-token');
    return Response.json({ ok: true });
  };

  const body = await authenticatedApiRequest<{ ok: boolean }>(
    '/api/example',
    'session-token',
    { method: 'POST' },
    fetchMock,
  );

  assert.deepEqual(body, { ok: true });
});

test('refuses to send credentials to a non-API URL', async () => {
  await assert.rejects(
    authenticatedApiRequest('https://attacker.example/collect', 'session-token'),
    /same-origin \/api\//,
  );
});

test('does not call fetch when no session token is available', async () => {
  let called = false;
  const fetchMock: typeof fetch = async () => {
    called = true;
    return Response.json({});
  };

  await assert.rejects(
    authenticatedApiRequest('/api/example', null, {}, fetchMock),
    (error: unknown) => error instanceof ApiRequestError && error.status === 401,
  );
  assert.equal(called, false);
});

test('surfaces a safe API error message and status', async () => {
  const fetchMock: typeof fetch = async () => Response.json(
    { error: { message: 'Too many API requests.' } },
    { status: 429 },
  );

  await assert.rejects(
    authenticatedApiRequest('/api/example', 'session-token', {}, fetchMock),
    (error: unknown) => (
      error instanceof ApiRequestError
      && error.status === 429
      && error.message === 'Too many API requests.'
    ),
  );
});
