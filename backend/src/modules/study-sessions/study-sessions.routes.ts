import { Router } from 'express';
import { studySessionsController } from './study-sessions.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createManualSessionSchema,
  startTimerSchema,
  finishTimerSchema,
  updateSessionSchema,
  listSessionsSchema,
  idParamSchema,
} from './study-sessions.schema';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ---- Timer routes (order matters: specific before :id) ----
router.get('/timer/active', studySessionsController.getActiveTimer);

router.post(
  '/timer/start',
  validate(startTimerSchema),
  studySessionsController.startTimer
);

router.post(
  '/timer/:id/pause',
  validate(idParamSchema, 'params'),
  studySessionsController.pauseTimer
);

router.post(
  '/timer/:id/resume',
  validate(idParamSchema, 'params'),
  studySessionsController.resumeTimer
);

router.post(
  '/timer/:id/finish',
  validate(idParamSchema, 'params'),
  validate(finishTimerSchema),
  studySessionsController.finishTimer
);

router.post(
  '/timer/:id/cancel',
  validate(idParamSchema, 'params'),
  studySessionsController.cancelTimer
);

// ---- Manual session ----
router.post(
  '/manual',
  validate(createManualSessionSchema),
  studySessionsController.createManual
);

// ---- Session CRUD ----
router.get(
  '/',
  validate(listSessionsSchema, 'query'),
  studySessionsController.list
);

router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  studySessionsController.getById
);

router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateSessionSchema),
  studySessionsController.update
);

router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  studySessionsController.remove
);

export { router as studySessionsRoutes };
