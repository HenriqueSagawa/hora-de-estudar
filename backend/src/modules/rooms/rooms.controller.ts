import { Request, Response } from 'express';
import { roomsService } from './rooms.service';
import {
  CreateRoomInput,
  UpdateRoomInput,
  UpdateMemberRoleInput,
  ListRoomsInput,
} from './rooms.schema';

export class RoomsController {
  create = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const data = req.body as CreateRoomInput;
    const room = await roomsService.createRoom(userId, data);

    res.status(201).json({
      message: 'Room created successfully',
      data: room,
    });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = req.query as unknown as ListRoomsInput;
    const result = await roomsService.listRooms(userId, query);

    res.status(200).json({
      message: 'Rooms fetched successfully',
      data: result,
    });
  };

  getById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    const room = await roomsService.getRoom(userId, id);

    res.status(200).json({
      message: 'Room retrieved successfully',
      data: room,
    });
  };

  update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body as UpdateRoomInput;
    const room = await roomsService.updateRoom(userId, id, data);

    res.status(200).json({
      message: 'Room updated successfully',
      data: room,
    });
  };

  remove = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    await roomsService.deleteRoom(userId, id);

    res.status(200).json({
      message: 'Room deleted successfully',
    });
  };

  join = async (req: Request<{ inviteCode: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { inviteCode } = req.params;
    const room = await roomsService.joinRoom(userId, inviteCode);

    res.status(200).json({
      message: 'Joined room successfully',
      data: room,
    });
  };

  leave = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    await roomsService.leaveRoom(userId, id);

    res.status(200).json({
      message: 'Left room successfully',
    });
  };

  listMembers = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    const members = await roomsService.listMembers(userId, id);

    res.status(200).json({
      message: 'Members retrieved successfully',
      data: members,
    });
  };

  updateMemberRole = async (
    req: Request<{ id: string; memberUserId: string }>,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const { id, memberUserId } = req.params;
    const data = req.body as UpdateMemberRoleInput;
    const member = await roomsService.updateMemberRole(
      userId,
      id,
      memberUserId,
      data
    );

    res.status(200).json({
      message: 'Member role updated successfully',
      data: member,
    });
  };

  removeMember = async (
    req: Request<{ id: string; memberUserId: string }>,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.id;
    const { id, memberUserId } = req.params;
    await roomsService.removeMember(userId, id, memberUserId);

    res.status(200).json({
      message: 'Member removed successfully',
    });
  };

  regenerateInvite = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await roomsService.regenerateInviteCode(userId, id);

    res.status(200).json({
      message: 'Invite code regenerated successfully',
      data: result,
    });
  };
}

export const roomsController = new RoomsController();
