import { Router } from 'express';
import { roomActivitiesController } from './room-activities.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  roomActivitiesParamSchema,
  roomActivitiesQuerySchema,
} from './room-activities.schema';

const router = Router();

router.use(authMiddleware);

router.get(
  '/:id/activities',
  validate(roomActivitiesParamSchema, 'params'),
  validate(roomActivitiesQuerySchema, 'query'),
  roomActivitiesController.getActivities
);

export { router as roomActivitiesRoutes };
