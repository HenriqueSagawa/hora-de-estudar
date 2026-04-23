import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError(ErrorCodes.TOKEN_MISSING);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError(ErrorCodes.TOKEN_MISSING);
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError(ErrorCodes.TOKEN_EXPIRED);
    }
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedError(ErrorCodes.TOKEN_INVALID);
    }
    throw new UnauthorizedError(ErrorCodes.TOKEN_INVALID);
  }
}
