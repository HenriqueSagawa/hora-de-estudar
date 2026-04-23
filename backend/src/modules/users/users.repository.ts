import { prisma } from '../../database/prisma';
import { Prisma } from '@prisma/client';

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  avatarUrl: true,
  bio: true,
  institution: true,
  course: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const userSearchSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export class UsersRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  }

  async findByIdWithPassword(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: userPublicSelect,
    });
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      select: userPublicSelect,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async search(query: string, skip: number, take: number) {
    const where: Prisma.UserWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSearchSelect,
        skip,
        take,
        orderBy: { username: 'asc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async countOwnedRoomsAsSoleOwner(userId: string): Promise<number> {
    // Find rooms where this user is OWNER and no other OWNER exists
    const ownedRooms = await prisma.room.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        members: {
          where: { role: 'OWNER', userId: { not: userId } },
          select: { id: true },
        },
      },
    });

    return ownedRooms.filter((room) => room.members.length === 0).length;
  }
}

export const usersRepository = new UsersRepository();
