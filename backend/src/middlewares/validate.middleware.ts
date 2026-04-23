import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed: unknown = schema.parse(req[target]);

    // Replace with parsed/coerced data
    if (target === 'body') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      req.body = parsed;
    } else if (target === 'query') {
      req.query = parsed as Record<string, string>;
    } else if (target === 'params') {
      req.params = parsed as Record<string, string>;
    }

    next();
  };
}
