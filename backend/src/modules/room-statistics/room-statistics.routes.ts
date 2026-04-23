import { Router } from 'express';
import { roomStatisticsController } from './room-statistics.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { roomStatsParamSchema, roomStatsQuerySchema } from './room-statistics.schema';

const router = Router();

router.use(authMiddleware);

router.get(
  '/:id/statistics/overview',
  validate(roomStatsParamSchema, 'params'),
  validate(roomStatsQuerySchema, 'query'),
  roomStatisticsController.getOverview
);

router.get(
  '/:id/statistics/by-member',
  validate(roomStatsParamSchema, 'params'),
  validate(roomStatsQuerySchema, 'query'),
  roomStatisticsController.getByMember
);

router.get(
  '/:id/statistics/by-day',
  validate(roomStatsParamSchema, 'params'),
  validate(roomStatsQuerySchema, 'query'),
  roomStatisticsController.getByDay
);

router.get(
  '/:id/statistics/by-subject',
  validate(roomStatsParamSchema, 'params'),
  validate(roomStatsQuerySchema, 'query'),
  roomStatisticsController.getBySubject
);

export { router as roomStatisticsRoutes };
