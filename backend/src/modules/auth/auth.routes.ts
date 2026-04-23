import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema } from './auth.schema';
import rateLimit from 'express-rate-limit';

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

export { router as authRoutes };
