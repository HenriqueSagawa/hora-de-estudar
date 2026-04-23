import { Router } from 'express';
import { rankingController } from './ranking.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { rankingQuerySchema, rankingParamSchema } from './ranking.schema';

const router = Router();

router.use(authMiddleware);

router.get(
  '/:id/ranking',
  validate(rankingParamSchema, 'params'),
  validate(rankingQuerySchema, 'query'),
  rankingController.getRanking
);

export { router as rankingRoutes };
