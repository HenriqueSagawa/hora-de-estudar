import { Router } from 'express';
import { usersController } from './users.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  updateProfileSchema,
  changePasswordSchema,
  searchUsersSchema,
} from './users.schema';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/me', usersController.getProfile);

router.patch(
  '/me',
  validate(updateProfileSchema),
  usersController.updateProfile
);

router.patch(
  '/me/password',
  validate(changePasswordSchema),
  usersController.changePassword
);

router.delete('/me', usersController.deleteAccount);

router.get(
  '/search',
  validate(searchUsersSchema, 'query'),
  usersController.searchUsers
);

export { router as usersRoutes };
