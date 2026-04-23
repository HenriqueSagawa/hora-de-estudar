import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error';
import { Prisma } from '@prisma/client';
import pino from 'pino';

const logger = pino({ name: 'error-handler' });

interface ErrorResponse {
  message: string;
  errors?: Array<{ field: string; message: string }>;
  stack?: string;
}

function getPrismaUniqueTarget(err: Prisma.PrismaClientKnownRequestError): string {
  const meta = err.meta;
  if (meta && typeof meta === 'object' && 'target' in meta && Array.isArray(meta.target)) {
    return (meta.target as string[]).join(', ');
  }
  return 'field';
}

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const response: ErrorResponse = {
    message: 'Internal server error',
  };

  let statusCode = 500;

  // Custom application errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.message = err.message;
  }

  // Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 422;
    response.message = 'Validation failed';
    response.errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Prisma known request errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        const target = getPrismaUniqueTarget(err);
        response.message = `A record with this ${target} already exists`;
        break;
      }
      case 'P2025':
        statusCode = 404;
        response.message = 'Record not found';
        break;
      default:
        statusCode = 400;
        response.message = 'Database error';
    }
  }

  // Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    response.message = 'Invalid data provided';
  }

  // JSON syntax errors
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    response.message = 'Invalid JSON in request body';
  }

  // Unknown errors — log full details
  else {
    logger.error(err, 'Unhandled error');
    response.message = 'Internal server error';
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
