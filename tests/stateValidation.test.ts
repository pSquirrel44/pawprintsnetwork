import assert from 'node:assert/strict';
import test from 'node:test';
import { statePayload } from '../server/validation';

test('accepts arrays for collection state and a bounded active profile ID', () => {
  const posts = [{ id: 'post_1' }];
  assert.equal(statePayload(posts, 'posts'), posts);
  assert.equal(statePayload('cat_1', 'active-profile'), 'cat_1');
});

test('rejects malformed state payloads', () => {
  assert.throws(() => statePayload({}, 'profiles'), /must be an array/);
  assert.throws(() => statePayload('', 'active-profile'), /non-empty string/);
  assert.throws(() => statePayload([], 'active-profile'), /non-empty string/);
});
