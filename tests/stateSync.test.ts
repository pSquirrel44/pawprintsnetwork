import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSpeciesState } from '../src/utils/stateSync';

const local = {
  profiles: [{ id: 'local-profile' }] as never[],
  posts: [{ id: 'local-post' }] as never[],
  stories: [] as never[],
  notifications: [] as never[],
  activeProfileId: 'local-profile',
};

test('prefers valid server state and does not reseed it', () => {
  const result = resolveSpeciesState({
    profiles: [{ id: 'remote-profile' }],
    posts: [],
    stories: [],
    notifications: [],
    'active-profile': 'remote-profile',
  }, local);

  assert.deepEqual(result.state.profiles, [{ id: 'remote-profile' }]);
  assert.equal(result.state.activeProfileId, 'remote-profile');
  assert.deepEqual(result.collectionsToSeed, []);
});

test('uses and seeds the scoped browser cache for missing server state', () => {
  const result = resolveSpeciesState({
    profiles: null,
    posts: null,
    stories: null,
    notifications: null,
    'active-profile': null,
  }, local);

  assert.deepEqual(result.state, local);
  assert.deepEqual(
    result.collectionsToSeed.map(({ collection }) => collection).sort(),
    ['active-profile', 'notifications', 'posts', 'profiles', 'stories'],
  );
});

test('rejects malformed server collection shapes in favor of the cache', () => {
  const result = resolveSpeciesState({
    profiles: { unexpected: true },
    posts: [],
    stories: [],
    notifications: [],
    'active-profile': '',
  }, local);

  assert.equal(result.state.profiles, local.profiles);
  assert.equal(result.state.activeProfileId, local.activeProfileId);
  assert.deepEqual(
    result.collectionsToSeed.map(({ collection }) => collection).sort(),
    ['active-profile', 'profiles'],
  );
});
