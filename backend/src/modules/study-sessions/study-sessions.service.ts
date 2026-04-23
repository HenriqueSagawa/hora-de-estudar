import { StudySessionSource, TimerStatus, type Prisma } from '@prisma/client';
import { studySessionsRepository } from './study-sessions.repository';
import { AppError, ForbiddenError, NotFoundError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import {
  CreateManualSessionInput,
  StartTimerInput,
  FinishTimerInput,
  UpdateSessionInput,
  ListSessionsInput,
} from './study-sessions.schema';
import { StudySessionDto, ActiveTimerDto } from './study-sessions.types';
import { PaginatedResponse } from '../../types/common';
import { parsePagination, buildPaginatedResponse } from '../../utils/pagination';
import { resolveDateRange } from '../../utils/date';
import { prisma } from '../../database/prisma';
import { differenceInSeconds } from 'date-fns';

export class StudySessionsService {
  // =========================================
  // MANUAL SESSION
  // =========================================

  async createManualSession(
    userId: string,
    data: CreateManualSessionInput
  ): Promise<StudySessionDto> {
    // Validate room membership if roomId provided
    if (data.roomId) {
      await this.validateRoomMembership(userId, data.roomId);
    }

    const session = await studySessionsRepository.create({
      userId,
      title: data.title,
      description: data.description ?? null,
      subject: data.subject ?? null,
      studyType: data.studyType ?? null,
      source: StudySessionSource.MANUAL,
      durationSeconds: data.durationSeconds,
      studyDate: new Date(data.studyDate),
      focusLevel: data.focusLevel ?? null,
      roomId: data.roomId ?? null,
    });

    // Log room activity if linked to a room
    if (session.roomId) {
      await this.logSessionActivity(userId, session.roomId, session.durationSeconds);
    }

    return session;
  }

  // =========================================
  // TIMER OPERATIONS
  // =========================================

  async startTimer(userId: string, data: StartTimerInput): Promise<ActiveTimerDto> {
    // Check for existing active timer
    const existing = await studySessionsRepository.findActiveTimer(userId);
    if (existing) {
      throw new AppError(ErrorCodes.TIMER_ALREADY_ACTIVE, 409);
    }

    // Validate room membership if roomId provided
    if (data.roomId) {
      await this.validateRoomMembership(userId, data.roomId);
    }

    const timer = await studySessionsRepository.createTimer({
      userId,
      title: data.title,
      description: data.description ?? null,
      subject: data.subject ?? null,
      studyType: data.studyType ?? null,
      roomId: data.roomId ?? null,
      status: TimerStatus.RUNNING,
    });

    return this.toTimerDto(timer);
  }

  async pauseTimer(userId: string, timerId: string): Promise<ActiveTimerDto> {
    const timer = await this.getOwnedTimer(userId, timerId);

    if (timer.status !== TimerStatus.RUNNING) {
      throw new AppError(ErrorCodes.TIMER_NOT_RUNNING, 400);
    }

    const updated = await studySessionsRepository.updateTimer(timerId, {
      status: TimerStatus.PAUSED,
      lastPausedAt: new Date(),
    });

    return this.toTimerDto(updated);
  }

  async resumeTimer(userId: string, timerId: string): Promise<ActiveTimerDto> {
    const timer = await this.getOwnedTimer(userId, timerId);

    if (timer.status !== TimerStatus.PAUSED) {
      throw new AppError(ErrorCodes.TIMER_NOT_PAUSED, 400);
    }

    // Calculate paused duration and add to total
    const pausedDuration = timer.lastPausedAt
      ? differenceInSeconds(new Date(), timer.lastPausedAt)
      : 0;

    const updated = await studySessionsRepository.updateTimer(timerId, {
      status: TimerStatus.RUNNING,
      totalPausedSeconds: timer.totalPausedSeconds + pausedDuration,
      lastPausedAt: null,
    });

    return this.toTimerDto(updated);
  }

  async finishTimer(
    userId: string,
    timerId: string,
    data: FinishTimerInput
  ): Promise<StudySessionDto> {
    const timer = await this.getOwnedTimer(userId, timerId);
    const now = new Date();

    // Calculate total duration
    let totalPaused = timer.totalPausedSeconds;

    // If currently paused, add the current pause duration
    if (timer.status === TimerStatus.PAUSED && timer.lastPausedAt) {
      totalPaused += differenceInSeconds(now, timer.lastPausedAt);
    }

    const totalElapsed = differenceInSeconds(now, timer.startedAt);
    const durationSeconds = Math.max(1, totalElapsed - totalPaused);

    const session = await studySessionsRepository.finishTimerAndCreateSession(
      timerId,
      {
        userId,
        title: timer.title,
        description: timer.description,
        subject: timer.subject,
        studyType: timer.studyType,
        source: StudySessionSource.TIMER,
        durationSeconds,
        startedAt: timer.startedAt,
        endedAt: now,
        studyDate: timer.startedAt,
        focusLevel: data.focusLevel ?? null,
        roomId: timer.roomId,
      }
    );

    // Log room activity if linked to a room
    if (session.roomId) {
      await this.logSessionActivity(userId, session.roomId, session.durationSeconds);
    }

    return session;
  }

  async cancelTimer(userId: string, timerId: string): Promise<void> {
    await this.getOwnedTimer(userId, timerId);
    await studySessionsRepository.deleteTimer(timerId);
  }

  async getActiveTimer(userId: string): Promise<ActiveTimerDto | null> {
    const timer = await studySessionsRepository.findActiveTimer(userId);
    if (!timer) return null;
    return this.toTimerDto(timer);
  }

  // =========================================
  // SESSION CRUD
  // =========================================

  async listSessions(
    userId: string,
    query: ListSessionsInput
  ): Promise<PaginatedResponse<StudySessionDto>> {
    const pagination = parsePagination({
      page: query.page,
      pageSize: query.pageSize,
    });

    const dateRange = resolveDateRange(query.period, query.startDate, query.endDate);

    const where: Prisma.StudySessionWhereInput = {
      userId,
      ...(dateRange && {
        studyDate: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      }),
      ...(query.subject && { subject: query.subject }),
      ...(query.source && { source: query.source }),
      ...(query.roomId && { roomId: query.roomId }),
    };

    const orderBy: Prisma.StudySessionOrderByWithRelationInput = {
      [query.orderBy || 'createdAt']: query.orderDirection || 'desc',
    };

    const { items, total } = await studySessionsRepository.findMany({
      where,
      orderBy,
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    });

    return buildPaginatedResponse(items, total, pagination);
  }

  async getSession(userId: string, sessionId: string): Promise<StudySessionDto> {
    const session = await studySessionsRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Study session');
    }

    if (session.userId !== userId) {
      throw new ForbiddenError(ErrorCodes.SESSION_NOT_OWNED);
    }

    return session;
  }

  async updateSession(
    userId: string,
    sessionId: string,
    data: UpdateSessionInput
  ): Promise<StudySessionDto> {
    const session = await studySessionsRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Study session');
    }

    if (session.userId !== userId) {
      throw new ForbiddenError(ErrorCodes.SESSION_NOT_OWNED);
    }

    const updated = await studySessionsRepository.update(sessionId, data);
    return updated;
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    const session = await studySessionsRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Study session');
    }

    if (session.userId !== userId) {
      throw new ForbiddenError(ErrorCodes.SESSION_NOT_OWNED);
    }

    await studySessionsRepository.delete(sessionId);
  }

  // =========================================
  // PRIVATE HELPERS
  // =========================================

  private async getOwnedTimer(userId: string, timerId: string) {
    const timer = await studySessionsRepository.findTimerById(timerId);

    if (!timer) {
      throw new NotFoundError('Active timer');
    }

    if (timer.userId !== userId) {
      throw new ForbiddenError(ErrorCodes.TIMER_NOT_OWNED);
    }

    return timer;
  }

  private async validateRoomMembership(
    userId: string,
    roomId: string
  ): Promise<void> {
    const membership = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!membership) {
      throw new ForbiddenError(ErrorCodes.NOT_ROOM_MEMBER_FOR_SESSION);
    }
  }

  private toTimerDto(timer: {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    subject: string | null;
    studyType: string | null;
    roomId: string | null;
    status: string;
    startedAt: Date;
    totalPausedSeconds: number;
    lastPausedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ActiveTimerDto {
    const now = new Date();
    const totalElapsed = differenceInSeconds(now, timer.startedAt);

    let currentPause = 0;
    if (timer.status === 'PAUSED' && timer.lastPausedAt) {
      currentPause = differenceInSeconds(now, timer.lastPausedAt);
    }

    const elapsedSeconds = Math.max(
      0,
      totalElapsed - timer.totalPausedSeconds - currentPause
    );

    return {
      ...timer,
      elapsedSeconds,
    };
  }

  private async logSessionActivity(
    userId: string,
    roomId: string,
    durationSeconds: number
  ): Promise<void> {
    try {
      const hours = Math.round((durationSeconds / 3600) * 10) / 10;
      await prisma.roomActivity.create({
        data: {
          roomId,
          userId,
          type: 'SESSION_LOGGED',
          message: `logged a study session of ${hours}h`,
          metadata: { durationSeconds } satisfies Prisma.JsonObject,
        },
      });
    } catch {
      // Non-critical — don't fail the main operation
    }
  }
}

export const studySessionsService = new StudySessionsService();
