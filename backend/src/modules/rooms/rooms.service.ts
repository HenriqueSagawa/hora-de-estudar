import { RoomMemberRole, RoomActivityType, type Prisma } from '@prisma/client';
import { roomsRepository } from './rooms.repository';
import { prisma } from '../../database/prisma';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import {
  CreateRoomInput,
  UpdateRoomInput,
  UpdateMemberRoleInput,
  ListRoomsInput,
} from './rooms.schema';
import { RoomDetailDto, RoomMemberDto } from './rooms.types';
import { PaginatedResponse } from '../../types/common';
import { parsePagination, buildPaginatedResponse } from '../../utils/pagination';
import { generateInviteCode } from '../../utils/invite-code';

export class RoomsService {
  async createRoom(userId: string, data: CreateRoomInput): Promise<RoomDetailDto> {
    const inviteCode = generateInviteCode();

    const room = await prisma.$transaction(async (tx) => {
      const created = await tx.room.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          coverImageUrl: data.coverImageUrl ?? null,
          visibility: data.visibility,
          ownerId: userId,
          inviteCode,
        },
        include: {
          owner: {
            select: { id: true, name: true, username: true, avatarUrl: true },
          },
          _count: { select: { members: true } },
        },
      });

      // Add creator as OWNER member
      await tx.roomMember.create({
        data: {
          roomId: created.id,
          userId,
          role: RoomMemberRole.OWNER,
        },
      });

      return created;
    });

    return this.toRoomDetailDto(room);
  }

  async listRooms(
    userId: string,
    query: ListRoomsInput
  ): Promise<PaginatedResponse<RoomDetailDto>> {
    const pagination = parsePagination({
      page: query.page,
      pageSize: query.pageSize,
    });

    const { items, total } = await roomsRepository.findUserRooms(
      userId,
      (pagination.page - 1) * pagination.pageSize,
      pagination.pageSize,
      query.search
    );

    const dtos = items.map((r) => this.toRoomDetailDto(r));
    return buildPaginatedResponse(dtos, total, pagination);
  }

  async getRoom(userId: string, roomId: string): Promise<RoomDetailDto> {
    const room = await roomsRepository.findById(roomId);

    if (!room) {
      throw new NotFoundError('Room');
    }

    // Check visibility / membership
    const membership = await roomsRepository.findMember(roomId, userId);
    if (!membership && room.visibility !== 'PUBLIC') {
      throw new ForbiddenError(ErrorCodes.ROOM_NOT_MEMBER);
    }

    return this.toRoomDetailDto(room);
  }

  async updateRoom(
    userId: string,
    roomId: string,
    data: UpdateRoomInput
  ): Promise<RoomDetailDto> {
    await this.requireRole(roomId, userId, ['OWNER', 'ADMIN']);

    const room = await roomsRepository.update(roomId, data);

    // Log activity
    await this.logActivity(roomId, userId, 'ROOM_UPDATED', 'updated the room');

    return this.toRoomDetailDto(room);
  }

  async deleteRoom(userId: string, roomId: string): Promise<void> {
    await this.requireRole(roomId, userId, ['OWNER']);
    await roomsRepository.delete(roomId);
  }

  async joinRoom(userId: string, inviteCode: string): Promise<RoomDetailDto> {
    const room = await roomsRepository.findByInviteCode(inviteCode);

    if (!room) {
      throw new NotFoundError(ErrorCodes.ROOM_INVITE_INVALID);
    }

    const existing = await roomsRepository.findMember(room.id, userId);
    if (existing) {
      throw new ConflictError(ErrorCodes.ROOM_ALREADY_MEMBER);
    }

    await roomsRepository.addMember(room.id, userId, RoomMemberRole.MEMBER);

    // Log activity
    await this.logActivity(room.id, userId, 'MEMBER_JOINED', 'joined the room');

    // Re-fetch to get updated counts
    const updated = await roomsRepository.findById(room.id);
    return this.toRoomDetailDto(updated!);
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    const membership = await roomsRepository.findMember(roomId, userId);

    if (!membership) {
      throw new AppError(ErrorCodes.ROOM_NOT_MEMBER, 400);
    }

    // If OWNER, check if sole owner
    if (membership.role === RoomMemberRole.OWNER) {
      const ownerCount = await roomsRepository.countOwners(roomId);
      if (ownerCount <= 1) {
        throw new AppError(ErrorCodes.ROOM_CANNOT_LEAVE_AS_SOLE_OWNER, 400);
      }
    }

    await roomsRepository.removeMember(roomId, userId);

    // Log activity
    await this.logActivity(roomId, userId, 'MEMBER_LEFT', 'left the room');
  }

  async listMembers(
    userId: string,
    roomId: string
  ): Promise<RoomMemberDto[]> {
    await this.requireMembership(roomId, userId);

    const members = await roomsRepository.listMembers(roomId);

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user,
    }));
  }

  async updateMemberRole(
    actorUserId: string,
    roomId: string,
    targetUserId: string,
    data: UpdateMemberRoleInput
  ): Promise<RoomMemberDto> {
    // Actor must be OWNER
    await this.requireRole(roomId, actorUserId, ['OWNER']);

    // Cannot change own role
    if (actorUserId === targetUserId) {
      throw new AppError(ErrorCodes.ROOM_CANNOT_CHANGE_OWN_ROLE, 400);
    }

    // Target must be a member
    const targetMember = await roomsRepository.findMember(roomId, targetUserId);
    if (!targetMember) {
      throw new NotFoundError(ErrorCodes.ROOM_MEMBER_NOT_FOUND);
    }

    // Cannot change role of another OWNER (only transfer supported explicitly)
    if (targetMember.role === RoomMemberRole.OWNER) {
      throw new ForbiddenError(ErrorCodes.ROOM_CANNOT_REMOVE_OWNER);
    }

    const newRole: RoomMemberRole =
      data.role === 'ADMIN' ? RoomMemberRole.ADMIN : RoomMemberRole.MEMBER;

    const updated = await roomsRepository.updateMemberRole(
      roomId,
      targetUserId,
      newRole
    );

    // Log activity
    const actionType: RoomActivityType =
      data.role === 'ADMIN' ? 'MEMBER_PROMOTED' : 'MEMBER_DEMOTED';
    const actionMsg =
      data.role === 'ADMIN'
        ? `promoted ${updated.user.username} to admin`
        : `demoted ${updated.user.username} to member`;
    await this.logActivity(roomId, actorUserId, actionType, actionMsg);

    return {
      id: updated.id,
      userId: updated.userId,
      role: updated.role,
      joinedAt: updated.joinedAt,
      user: updated.user,
    };
  }

  async removeMember(
    actorUserId: string,
    roomId: string,
    targetUserId: string
  ): Promise<void> {
    // Actor must be OWNER or ADMIN
    const actorMember = await this.requireRole(roomId, actorUserId, [
      'OWNER',
      'ADMIN',
    ]);

    // Cannot remove yourself (use leave instead)
    if (actorUserId === targetUserId) {
      throw new AppError('Use the leave endpoint to leave a room', 400);
    }

    const targetMember = await roomsRepository.findMember(roomId, targetUserId);
    if (!targetMember) {
      throw new NotFoundError(ErrorCodes.ROOM_MEMBER_NOT_FOUND);
    }

    // Cannot remove OWNER
    if (targetMember.role === RoomMemberRole.OWNER) {
      throw new ForbiddenError(ErrorCodes.ROOM_CANNOT_REMOVE_OWNER);
    }

    // ADMIN cannot remove another ADMIN
    if (
      actorMember.role === RoomMemberRole.ADMIN &&
      targetMember.role === RoomMemberRole.ADMIN
    ) {
      throw new ForbiddenError(ErrorCodes.ROOM_INSUFFICIENT_PERMISSIONS);
    }

    await roomsRepository.removeMember(roomId, targetUserId);

    // Log activity
    await this.logActivity(
      roomId,
      actorUserId,
      'MEMBER_REMOVED',
      `removed a member from the room`
    );
  }

  async regenerateInviteCode(
    userId: string,
    roomId: string
  ): Promise<{ inviteCode: string }> {
    await this.requireRole(roomId, userId, ['OWNER']);

    const newCode = generateInviteCode();
    await roomsRepository.update(roomId, { inviteCode: newCode });

    return { inviteCode: newCode };
  }

  // =========================================
  // PRIVATE HELPERS
  // =========================================

  private async requireMembership(roomId: string, userId: string) {
    const member = await roomsRepository.findMember(roomId, userId);
    if (!member) {
      throw new ForbiddenError(ErrorCodes.ROOM_NOT_MEMBER);
    }
    return member;
  }

  private async requireRole(
    roomId: string,
    userId: string,
    roles: RoomMemberRole[]
  ) {
    const member = await this.requireMembership(roomId, userId);
    if (!roles.includes(member.role)) {
      throw new ForbiddenError(ErrorCodes.ROOM_INSUFFICIENT_PERMISSIONS);
    }
    return member;
  }

  private async logActivity(
    roomId: string,
    userId: string,
    type: RoomActivityType,
    message: string,
    metadata?: Prisma.JsonObject
  ): Promise<void> {
    try {
      await prisma.roomActivity.create({
        data: {
          roomId,
          userId,
          type,
          message,
          metadata,
        },
      });
    } catch {
      // Non-critical — don't fail the main operation
    }
  }

  private toRoomDetailDto(
    room: {
      id: string;
      name: string;
      description: string | null;
      coverImageUrl: string | null;
      inviteCode: string;
      visibility: string;
      ownerId: string;
      createdAt: Date;
      updatedAt: Date;
      owner: {
        id: string;
        name: string;
        username: string;
        avatarUrl: string | null;
      };
      _count: { members: number };
    }
  ): RoomDetailDto {
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      coverImageUrl: room.coverImageUrl,
      inviteCode: room.inviteCode,
      visibility: room.visibility as RoomDetailDto['visibility'],
      ownerId: room.ownerId,
      memberCount: room._count.members,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      owner: room.owner,
    };
  }
}

export const roomsService = new RoomsService();
