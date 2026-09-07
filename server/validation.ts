export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestValidationError';
  }
}

export function optionalText(
  value: unknown,
  field: string,
  maxLength: number,
  fallback = '',
): string {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value !== 'string') {
    throw new RequestValidationError(`${field} must be text.`);
  }

  const text = value.trim();
  if (text.length > maxLength) {
    throw new RequestValidationError(`${field} must be ${maxLength} characters or fewer.`);
  }

  return text;
}

export function booleanValue(value: unknown, field: string): boolean {
  if (value === undefined) {
    return false;
  }

  if (typeof value !== 'boolean') {
    throw new RequestValidationError(`${field} must be true or false.`);
  }

  return value;
}

export function enumValue<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new RequestValidationError(`${field} must be one of: ${allowed.join(', ')}.`);
  }

  return value as T;
}

export function statePayload(
  value: unknown,
  collection: 'profiles' | 'posts' | 'stories' | 'notifications' | 'active-profile',
): unknown {
  if (collection === 'active-profile') {
    if (typeof value !== 'string' || value.trim().length === 0 || value.length > 200) {
      throw new RequestValidationError('active-profile must be a non-empty string of 200 characters or fewer.');
    }
    return value;
  }

  if (!Array.isArray(value)) {
    throw new RequestValidationError(`${collection} must be an array.`);
  }

  if (value.length > 5_000) {
    throw new RequestValidationError(`${collection} may contain at most 5,000 items.`);
  }

  return value;
}

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function imageInput(imageBase64: unknown, mimeType: unknown) {
  if (imageBase64 === undefined || imageBase64 === null || imageBase64 === '') {
    return null;
  }

  if (typeof imageBase64 !== 'string') {
    throw new RequestValidationError('imageBase64 must be a base64 string.');
  }

  const dataUrlMatch = imageBase64.match(/^data:([^;,]+);base64,(.*)$/s);
  const suppliedMimeType = optionalText(mimeType, 'mimeType', 50);
  const resolvedMimeType = (dataUrlMatch?.[1] || suppliedMimeType || 'image/jpeg').toLowerCase();
  const data = (dataUrlMatch?.[2] || imageBase64).replace(/\s/g, '');

  if (!allowedImageTypes.has(resolvedMimeType)) {
    throw new RequestValidationError('Images must be JPEG, PNG, or WebP.');
  }

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data) || data.length % 4 !== 0) {
    throw new RequestValidationError('imageBase64 is not valid base64 data.');
  }

  const estimatedBytes = (data.length * 3) / 4 - (data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0);
  if (estimatedBytes > 6_000_000) {
    throw new RequestValidationError('Images must be 6 MB or smaller.');
  }

  return { data, mimeType: resolvedMimeType };
}
