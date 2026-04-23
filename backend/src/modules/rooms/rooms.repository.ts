import { prisma } from '../../database/prisma';
import { Prisma, RoomMemberRole } from '@prisma/client';

const memberUserSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export class RoomsRepository {
  async create(data: Prisma.RoomUncheckedCreateInput) {
    return prisma.room.create({
      data,
      include: {
        owner: { select: memberUserSelect },
        _count: { select: { members: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.room.findUnique({
      where: { id },
      include: {
        owner: { select: memberUserSelect },
        _count: { select: { members: true } },
      },
    });
  }

  async findByInviteCode(inviteCode: string) {
    return prisma.room.findUnique({
      where: { inviteCode },
      include: {
        owner: { select: memberUserSelect },
        _count: { select: { members: true } },
      },
    });
  }

  async update(id: string, data: Prisma.RoomUpdateInput) {
    return prisma.room.update({
      where: { id },
      data,
      include: {
        owner: { select: memberUserSelect },
        _count: { select: { members: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.room.delete({ where: { id } });
  }

  async findUserRooms(
    userId: string,
    skip: number,
    take: number,
    search?: string
  ) {
    const where: Prisma.RoomWhereInput = {
      members: { some: { userId } },
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.room.findMany({
        where,
        include: {
          owner: { select: memberUserSelect },
          _count: { select: { members: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.room.count({ where }),
    ]);

    return { items, total };
  }

  // ---- Members ----

  async findMember(roomId: string, userId: string) {
    return prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
  }

  async addMember(roomId: string, userId: string, role: RoomMemberRole) {
    return prisma.roomMember.create({
      data: { roomId, userId, role },
      include: { user: { select: memberUserSelect } },
    });
  }

  async removeMember(roomId: string, userId: string) {
    return prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId } },
    });
  }

  async updateMemberRole(roomId: string, userId: string, role: RoomMemberRole) {
    return prisma.roomMember.update({
      where: { roomId_userId: { roomId, userId } },
      data: { role },
      include: { user: { select: memberUserSelect } },
    });
  }

  async listMembers(roomId: string) {
    return prisma.roomMember.findMany({
      where: { roomId },
      include: { user: { select: memberUserSelect } },
      orderBy: [
        { role: 'asc' }, // OWNER first, then ADMIN, then MEMBER
        { joinedAt: 'asc' },
      ],
    });
  }

  async countOwners(roomId: string): Promise<number> {
    return prisma.roomMember.count({
      where: { roomId, role: 'OWNER' },
    });
  }
}

export const roomsRepository = new RoomsRepository();
