import { getAuth } from '@clerk/express';
import type { RequestHandler } from 'express';

export interface VerifiedIdentity {
  userId: string;
  sessionId: string | null;
}

export function getVerifiedIdentity(auth: {
  userId?: string | null;
  sessionId?: string | null;
}): VerifiedIdentity | null {
  if (!auth.userId) return null;

  return {
    userId: auth.userId,
    sessionId: auth.sessionId || null,
  };
}

export const requireApiAuth: RequestHandler = (req, res, next) => {
  const identity = getVerifiedIdentity(getAuth(req));

  if (!identity) {
    res.status(401).json({
      error: {
        code: 'unauthorized',
        message: 'Authentication is required to access this resource.',
      },
    });
    return;
  }

  res.locals.auth = identity;
  next();
};
