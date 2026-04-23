import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthTokenPayload } from '../types/express';

export function signToken(payload: { id: string; email: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as unknown as number,
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}


