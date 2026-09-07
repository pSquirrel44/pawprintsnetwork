import assert from 'node:assert/strict';
import test from 'node:test';
import { getStorageKey } from '../src/utils/storage';

test('isolates browser records by Clerk owner, species, and collection', () => {
  const firstUserCatPosts = getStorageKey('user_one', 'cat', 'posts');

  assert.notEqual(firstUserCatPosts, getStorageKey('user_two', 'cat', 'posts'));
  assert.notEqual(firstUserCatPosts, getStorageKey('user_one', 'dog', 'posts'));
  assert.notEqual(firstUserCatPosts, getStorageKey('user_one', 'cat', 'profiles'));
});

test('refuses to construct an ownerless storage key', () => {
  assert.throws(() => getStorageKey('  ', 'cat', 'posts'), /Clerk user ID/);
});
