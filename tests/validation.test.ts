import assert from 'node:assert/strict';
import test from 'node:test';
import {
  booleanValue,
  enumValue,
  imageInput,
  optionalText,
  RequestValidationError,
} from '../server/validation';

test('normalizes bounded text and rejects oversized values', () => {
  assert.equal(optionalText('  hello  ', 'message', 10), 'hello');
  assert.throws(() => optionalText('too long', 'message', 3), RequestValidationError);
});

test('accepts only actual booleans and allowed enum values', () => {
  assert.equal(booleanValue(true, 'isDog'), true);
  assert.throws(() => booleanValue('true', 'isDog'), RequestValidationError);
  assert.equal(enumValue('cat-to-human', 'mode', ['cat-to-human', 'human-to-cat']), 'cat-to-human');
  assert.throws(
    () => enumValue('admin', 'mode', ['cat-to-human', 'human-to-cat']),
    RequestValidationError,
  );
});

test('normalizes an allowed image data URL', () => {
  assert.deepEqual(
    imageInput('data:image/png;base64,aGVsbG8=', undefined),
    { data: 'aGVsbG8=', mimeType: 'image/png' },
  );
});

test('rejects unsupported image types and malformed base64', () => {
  assert.throws(
    () => imageInput('data:image/svg+xml;base64,PHN2Zz4=', undefined),
    /JPEG, PNG, or WebP/,
  );
  assert.throws(() => imageInput('not-base64!', 'image/jpeg'), /valid base64/);
});
