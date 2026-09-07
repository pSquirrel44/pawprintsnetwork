import assert from 'node:assert/strict';
import test from 'node:test';
import { StateRepository } from '../server/stateRepository';

test('loads only state belonging to the verified user and species', async () => {
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  const repository = new StateRepository({
    async query(sql, values) {
      calls.push({ sql, values });
      return {
        rows: [
          { collection: 'profiles', payload: [{ id: 'cat_1' }] },
          { collection: 'active-profile', payload: 'cat_1' },
        ],
      };
    },
  });

  const state = await repository.getUserState('user_123', 'cat');

  assert.deepEqual(calls[0].values, ['user_123', 'cat']);
  assert.deepEqual(state.profiles, [{ id: 'cat_1' }]);
  assert.equal(state['active-profile'], 'cat_1');
  assert.equal(state.posts, null);
});

test('upserts a collection with parameterized values', async () => {
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  const repository = new StateRepository({
    async query(sql, values) {
      calls.push({ sql, values });
      return { rows: [] };
    },
  });

  await repository.saveCollection('user_123', 'dog', 'posts', [{ id: 'post_1' }]);

  assert.match(calls[0].sql, /ON CONFLICT/);
  assert.deepEqual(calls[0].values, [
    'user_123',
    'dog',
    'posts',
    JSON.stringify([{ id: 'post_1' }]),
  ]);
});
