/* eslint-disable @typescript-eslint/no-namespace */

import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  email: string;
}
