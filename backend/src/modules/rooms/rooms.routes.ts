import { Router } from 'express';
import { roomsController } from './rooms.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createRoomSchema,
  updateRoomSchema,
  roomIdParamSchema,
  inviteCodeParamSchema,
  memberParamSchema,
  updateMemberRoleSchema,
  listRoomsSchema,
} from './rooms.schema';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Room CRUD
router.post('/', validate(createRoomSchema), roomsController.create);

router.get(
  '/',
  validate(listRoomsSchema, 'query'),
  roomsController.list
);

router.get(
  '/:id',
  validate(roomIdParamSchema, 'params'),
  roomsController.getById
);

router.patch(
  '/:id',
  validate(roomIdParamSchema, 'params'),
  validate(updateRoomSchema),
  roomsController.update
);

router.delete(
  '/:id',
  validate(roomIdParamSchema, 'params'),
  roomsController.remove
);

// Join / Leave
router.post(
  '/join/:inviteCode',
  validate(inviteCodeParamSchema, 'params'),
  roomsController.join
);

router.post(
  '/:id/leave',
  validate(roomIdParamSchema, 'params'),
  roomsController.leave
);

// Members
router.get(
  '/:id/members',
  validate(roomIdParamSchema, 'params'),
  roomsController.listMembers
);

router.patch(
  '/:id/members/:memberUserId/role',
  validate(memberParamSchema, 'params'),
  validate(updateMemberRoleSchema),
  roomsController.updateMemberRole
);

router.delete(
  '/:id/members/:memberUserId',
  validate(memberParamSchema, 'params'),
  roomsController.removeMember
);

// Invite code
router.post(
  '/:id/regenerate-invite',
  validate(roomIdParamSchema, 'params'),
  roomsController.regenerateInvite
);

export { router as roomsRoutes };
