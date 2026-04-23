import { prisma } from '../../database/prisma';
import { ForbiddenError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { PaginatedResponse } from '../../types/common';
import { parsePagination, buildPaginatedResponse } from '../../utils/pagination';
import { RoomActivitiesQuery } from './room-activities.schema';

interface ActivityDto {
  id: string;
  roomId: string;
  userId: string;
  type: string;
  message: string;
  metadata: unknown;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
}

export class RoomActivitiesService {
  async getActivities(
    userId: string,
    roomId: string,
    query: RoomActivitiesQuery
  ): Promise<PaginatedResponse<ActivityDto>> {
    // Check membership
    const membership = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!membership) {
      throw new ForbiddenError(ErrorCodes.ROOM_NOT_MEMBER);
    }

    const pagination = parsePagination({
      page: query.page,
      pageSize: query.pageSize,
    });

    const where = { roomId };

    const [items, total] = await Promise.all([
      prisma.roomActivity.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, username: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.roomActivity.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, pagination);
  }
}

export const roomActivitiesService = new RoomActivitiesService();
