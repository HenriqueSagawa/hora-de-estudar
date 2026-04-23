import { prisma } from '../../database/prisma';
import { type Prisma } from '@prisma/client';
import { resolveDateRange } from '../../utils/date';
import { ForbiddenError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { RoomStatsQuery } from './room-statistics.schema';
import { format } from 'date-fns';

interface TallyEntry {
  totalSeconds: number;
  totalSessions: number;
}

export class RoomStatisticsService {
  async getOverview(userId: string, roomId: string, query: RoomStatsQuery) {
    await this.requireMembership(roomId, userId);

    const dateRange = resolveDateRange(query.period, query.startDate, query.endDate);

    const sessionWhere: Prisma.StudySessionWhereInput = {
      roomId,
      ...(dateRange && {
        studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
      }),
    };

    const [sessions, memberCount] = await Promise.all([
      prisma.studySession.findMany({
        where: sessionWhere,
        select: {
          userId: true,
          durationSeconds: true,
          source: true,
          subject: true,
        },
      }),
      prisma.roomMember.count({ where: { roomId } }),
    ]);

    const totalSeconds = sessions.reduce((s, ss) => s + ss.durationSeconds, 0);
    const totalSessions = sessions.length;
    const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;
    const averagePerMember = memberCount > 0
      ? Math.round(totalSeconds / memberCount)
      : 0;

    // Top 3 members
    const memberSecondsMap = new Map<string, number>();
    for (const s of sessions) {
      memberSecondsMap.set(s.userId, (memberSecondsMap.get(s.userId) ?? 0) + s.durationSeconds);
    }

    const topMemberIds = Array.from(memberSecondsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const topMemberUsers = await prisma.user.findMany({
      where: { id: { in: topMemberIds } },
      select: { id: true, name: true, username: true, avatarUrl: true },
    });

    const top3 = topMemberIds.map((id) => {
      const user = topMemberUsers.find((u) => u.id === id);
      const secs = memberSecondsMap.get(id) ?? 0;
      return {
        userId: id,
        name: user?.name ?? '',
        username: user?.username ?? '',
        avatarUrl: user?.avatarUrl ?? null,
        totalSeconds: secs,
        totalHours: Math.round((secs / 3600) * 100) / 100,
      };
    });

    // Top subject
    const subjectSecondsMap = new Map<string, number>();
    for (const s of sessions) {
      if (s.subject) {
        subjectSecondsMap.set(s.subject, (subjectSecondsMap.get(s.subject) ?? 0) + s.durationSeconds);
      }
    }

    let topSubject: string | null = null;
    let topSubjectTime = 0;
    for (const [subject, time] of subjectSecondsMap) {
      if (time > topSubjectTime) {
        topSubject = subject;
        topSubjectTime = time;
      }
    }

    return {
      totalSeconds,
      totalHours,
      totalSessions,
      memberCount,
      averagePerMember,
      topSubject,
      top3,
    };
  }

  async getByMember(userId: string, roomId: string, query: RoomStatsQuery) {
    await this.requireMembership(roomId, userId);

    const dateRange = resolveDateRange(query.period, query.startDate, query.endDate);

    const sessionWhere: Prisma.StudySessionWhereInput = {
      roomId,
      ...(dateRange && {
        studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
      }),
    };

    const sessions = await prisma.studySession.findMany({
      where: sessionWhere,
      select: { userId: true, durationSeconds: true },
    });

    const memberMap = new Map<string, TallyEntry>();
    for (const s of sessions) {
      const current = memberMap.get(s.userId) ?? { totalSeconds: 0, totalSessions: 0 };
      current.totalSeconds += s.durationSeconds;
      current.totalSessions += 1;
      memberMap.set(s.userId, current);
    }

    const memberIds = Array.from(memberMap.keys());
    const users = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true, username: true, avatarUrl: true },
    });

    return Array.from(memberMap.entries())
      .map(([memberId, data]) => {
        const user = users.find((u) => u.id === memberId);
        return {
          userId: memberId,
          name: user?.name ?? '',
          username: user?.username ?? '',
          avatarUrl: user?.avatarUrl ?? null,
          totalSeconds: data.totalSeconds,
          totalHours: Math.round((data.totalSeconds / 3600) * 100) / 100,
          totalSessions: data.totalSessions,
        };
      })
      .sort((a, b) => b.totalSeconds - a.totalSeconds);
  }

  async getByDay(userId: string, roomId: string, query: RoomStatsQuery) {
    await this.requireMembership(roomId, userId);

    const dateRange = resolveDateRange(
      query.period ?? 'month',
      query.startDate,
      query.endDate
    );

    if (!dateRange) return [];

    const sessions = await prisma.studySession.findMany({
      where: {
        roomId,
        studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      select: { studyDate: true, durationSeconds: true },
    });

    const dayMap = new Map<string, TallyEntry>();
    for (const s of sessions) {
      const key = format(s.studyDate, 'yyyy-MM-dd');
      const current = dayMap.get(key) ?? { totalSeconds: 0, totalSessions: 0 };
      current.totalSeconds += s.durationSeconds;
      current.totalSessions += 1;
      dayMap.set(key, current);
    }

    return Array.from(dayMap.entries())
      .map(([date, data]) => ({
        date,
        totalSeconds: data.totalSeconds,
        totalSessions: data.totalSessions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getBySubject(userId: string, roomId: string, query: RoomStatsQuery) {
    await this.requireMembership(roomId, userId);

    const dateRange = resolveDateRange(query.period, query.startDate, query.endDate);

    const sessions = await prisma.studySession.findMany({
      where: {
        roomId,
        subject: { not: null },
        ...(dateRange && {
          studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
        }),
      },
      select: { subject: true, durationSeconds: true },
    });

    const subjectMap = new Map<string, TallyEntry>();
    for (const s of sessions) {
      if (!s.subject) continue;
      const current = subjectMap.get(s.subject) ?? { totalSeconds: 0, totalSessions: 0 };
      current.totalSeconds += s.durationSeconds;
      current.totalSessions += 1;
      subjectMap.set(s.subject, current);
    }

    const grandTotal = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);

    return Array.from(subjectMap.entries())
      .map(([subject, data]) => ({
        subject,
        totalSeconds: data.totalSeconds,
        totalHours: Math.round((data.totalSeconds / 3600) * 100) / 100,
        totalSessions: data.totalSessions,
        percentage: grandTotal > 0
          ? Math.round((data.totalSeconds / grandTotal) * 10000) / 100
          : 0,
      }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds);
  }

  private async requireMembership(roomId: string, userId: string): Promise<void> {
    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!member) {
      throw new ForbiddenError(ErrorCodes.ROOM_NOT_MEMBER);
    }
  }
}

export const roomStatisticsService = new RoomStatisticsService();
