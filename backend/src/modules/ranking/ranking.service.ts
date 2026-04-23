import { prisma } from '../../database/prisma';
import { type Prisma } from '@prisma/client';
import { resolveDateRange } from '../../utils/date';
import { ForbiddenError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { RankingQuery } from './ranking.schema';
import { RankingEntry } from './ranking.types';

interface MemberStats {
  totalSeconds: number;
  totalSessions: number;
  manualSeconds: number;
  manualCount: number;
  timerSeconds: number;
  timerCount: number;
}

const DEFAULT_STATS: MemberStats = {
  totalSeconds: 0,
  totalSessions: 0,
  manualSeconds: 0,
  manualCount: 0,
  timerSeconds: 0,
  timerCount: 0,
};

export class RankingService {
  async getRoomRanking(
    userId: string,
    roomId: string,
    query: RankingQuery
  ): Promise<RankingEntry[]> {
    // Check membership
    const membership = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!membership) {
      throw new ForbiddenError(ErrorCodes.ROOM_NOT_MEMBER);
    }

    const dateRange = resolveDateRange(query.period, query.startDate, query.endDate);

    // Get all members
    const members = await prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
      },
    });

    // Build session where clause
    const sessionWhere: Prisma.StudySessionWhereInput = {
      roomId,
      ...(dateRange && {
        studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
      }),
      ...(query.source && query.source !== 'all' && {
        source: query.source,
      }),
    };

    // Get all sessions for this room in the period
    const sessions = await prisma.studySession.findMany({
      where: sessionWhere,
      select: {
        userId: true,
        durationSeconds: true,
        source: true,
      },
    });

    // Initialize all members with zeros
    const memberStats = new Map<string, MemberStats>();
    for (const member of members) {
      memberStats.set(member.userId, { ...DEFAULT_STATS });
    }

    // Aggregate session data
    for (const session of sessions) {
      const stats = memberStats.get(session.userId);
      if (!stats) continue; // Session from a user no longer in the room

      stats.totalSeconds += session.durationSeconds;
      stats.totalSessions += 1;

      if (session.source === 'MANUAL') {
        stats.manualSeconds += session.durationSeconds;
        stats.manualCount += 1;
      } else {
        stats.timerSeconds += session.durationSeconds;
        stats.timerCount += 1;
      }
    }

    // Build ranking — members not in memberStats get zeroed stats
    const ranking: RankingEntry[] = members
      .map((member) => {
        const stats = memberStats.get(member.userId) ?? { ...DEFAULT_STATS };
        return {
          position: 0,
          userId: member.user.id,
          name: member.user.name,
          username: member.user.username,
          avatarUrl: member.user.avatarUrl,
          totalSeconds: stats.totalSeconds,
          totalHours: Math.round((stats.totalSeconds / 3600) * 100) / 100,
          totalSessions: stats.totalSessions,
          breakdown: {
            manual: {
              totalSeconds: stats.manualSeconds,
              count: stats.manualCount,
            },
            timer: {
              totalSeconds: stats.timerSeconds,
              count: stats.timerCount,
            },
          },
        };
      })
      .sort((a, b) => {
        // Sort by totalSeconds descending, then by totalSessions descending (tie-breaker)
        if (b.totalSeconds !== a.totalSeconds) {
          return b.totalSeconds - a.totalSeconds;
        }
        return b.totalSessions - a.totalSessions;
      });

    // Assign positions (same position for same totalSeconds)
    let currentPosition = 1;
    for (let i = 0; i < ranking.length; i++) {
      const current = ranking[i];
      const previous = ranking[i - 1];
      if (i > 0 && current && previous && current.totalSeconds < previous.totalSeconds) {
        currentPosition = i + 1;
      }
      if (current) {
        current.position = currentPosition;
      }
    }

    return ranking;
  }
}

export const rankingService = new RankingService();
