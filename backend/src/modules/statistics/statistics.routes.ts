import { Router } from 'express';
import { statisticsController } from './statistics.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { statisticsQuerySchema } from './statistics.schema';

const router = Router();

router.use(authMiddleware);

router.get(
  '/me/overview',
  validate(statisticsQuerySchema, 'query'),
  statisticsController.getOverview
);

router.get(
  '/me/by-subject',
  validate(statisticsQuerySchema, 'query'),
  statisticsController.getBySubject
);

router.get(
  '/me/by-day',
  validate(statisticsQuerySchema, 'query'),
  statisticsController.getByDay
);

router.get(
  '/me/by-week',
  validate(statisticsQuerySchema, 'query'),
  statisticsController.getByWeek
);

router.get(
  '/me/by-month',
  validate(statisticsQuerySchema, 'query'),
  statisticsController.getByMonth
);

router.get(
  '/me/heatmap',
  validate(statisticsQuerySchema, 'query'),
  statisticsController.getHeatmap
);

export { router as statisticsRoutes };
