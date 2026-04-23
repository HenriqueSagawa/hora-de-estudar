import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { usersRoutes } from '../modules/users/users.routes';
import { studySessionsRoutes } from '../modules/study-sessions/study-sessions.routes';
import { statisticsRoutes } from '../modules/statistics/statistics.routes';
import { roomsRoutes } from '../modules/rooms/rooms.routes';
import { rankingRoutes } from '../modules/ranking/ranking.routes';
import { roomStatisticsRoutes } from '../modules/room-statistics/room-statistics.routes';
import { roomActivitiesRoutes } from '../modules/room-activities/room-activities.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/study-sessions', studySessionsRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/rooms', roomsRoutes);

// Room sub-routes (ranking, statistics, activities) mounted under /rooms
router.use('/rooms', rankingRoutes);
router.use('/rooms', roomStatisticsRoutes);
router.use('/rooms', roomActivitiesRoutes);

export { router as apiRouter };
