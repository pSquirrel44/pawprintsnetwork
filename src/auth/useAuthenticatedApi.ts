import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function authenticatedApiRequest<T>(
  path: string,
  token: string | null,
  init: RequestInit = {},
  fetchImplementation: typeof fetch = fetch,
): Promise<T> {
  if (!path.startsWith('/api/')) {
    throw new Error('Authenticated API requests must use a same-origin /api/ path.');
  }

  if (!token) {
    throw new ApiRequestError('A valid session token is unavailable.', 401);
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetchImplementation(path, {
    ...init,
    headers,
    credentials: 'same-origin',
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = body?.error?.message || body?.error || `Request failed with status ${response.status}.`;
    throw new ApiRequestError(message, response.status);
  }

  return body as T;
}

export function useAuthenticatedApi() {
  const { getToken, isSignedIn } = useAuth();

  return useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    if (!isSignedIn) {
      throw new ApiRequestError('Your session has ended. Please sign in again.', 401);
    }

    const token = await getToken();
    return authenticatedApiRequest<T>(path, token, init);
  }, [getToken, isSignedIn]);
}
