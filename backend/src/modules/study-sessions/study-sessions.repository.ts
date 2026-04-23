import { prisma } from '../../database/prisma';
import { type Prisma } from '@prisma/client';

export class StudySessionsRepository {
  async create(data: Prisma.StudySessionUncheckedCreateInput) {
    return prisma.studySession.create({ data });
  }

  async findById(id: string) {
    return prisma.studySession.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.StudySessionUpdateInput) {
    return prisma.studySession.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.studySession.delete({ where: { id } });
  }

  async findMany(params: {
    where: Prisma.StudySessionWhereInput;
    orderBy?: Prisma.StudySessionOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const [items, total] = await Promise.all([
      prisma.studySession.findMany({
        where: params.where,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
      }),
      prisma.studySession.count({ where: params.where }),
    ]);

    return { items, total };
  }

  // ---- Active Timer ----

  async findActiveTimer(userId: string) {
    return prisma.activeTimer.findUnique({ where: { userId } });
  }

  async createTimer(data: Prisma.ActiveTimerUncheckedCreateInput) {
    return prisma.activeTimer.create({ data });
  }

  async findTimerById(id: string) {
    return prisma.activeTimer.findUnique({ where: { id } });
  }

  async updateTimer(id: string, data: Prisma.ActiveTimerUpdateInput) {
    return prisma.activeTimer.update({ where: { id }, data });
  }

  async deleteTimer(id: string) {
    return prisma.activeTimer.delete({ where: { id } });
  }

  // ---- Timer + Session transaction ----
  async finishTimerAndCreateSession(
    timerId: string,
    sessionData: Prisma.StudySessionUncheckedCreateInput
  ) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.studySession.create({ data: sessionData });
      await tx.activeTimer.delete({ where: { id: timerId } });
      return session;
    });
  }
}

export const studySessionsRepository = new StudySessionsRepository();
