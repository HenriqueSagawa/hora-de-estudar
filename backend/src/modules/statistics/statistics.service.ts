import { prisma } from '../../database/prisma';
import { Prisma } from '@prisma/client';
import { resolveDateRange } from '../../utils/date';
import { StatisticsQuery } from './statistics.schema';
import {
  OverviewStatistics,
  SubjectStatistics,
  DayStatistics,
  WeekStatistics,
  MonthStatistics,
  HeatmapEntry,
} from './statistics.types';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subDays,
  differenceInDays,
  startOfDay,
  endOfDay,
} from 'date-fns';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export class StatisticsService {
  async getOverview(
    userId: string,
    query: StatisticsQuery
  ): Promise<OverviewStatistics> {
    const dateRange = resolveDateRange(query.period, query.startDate, query.endDate);

    const where: Prisma.StudySessionWhereInput = {
      userId,
      ...(dateRange && {
        studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
      }),
    };

    const sessions = await prisma.studySession.findMany({
      where,
      select: {
        durationSeconds: true,
        source: true,
        subject: true,
        studyDate: true,
      },
      orderBy: { studyDate: 'asc' },
    });

    const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
    const totalSessions = sessions.length;
    const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;

    // Unique study days
    const uniqueDays = new Set(
      sessions.map((s) => format(s.studyDate, 'yyyy-MM-dd'))
    );
    const numDays = uniqueDays.size || 1;
    const averagePerDay = Math.round(totalSeconds / numDays);
    const averagePerSession =
      totalSessions > 0 ? Math.round(totalSeconds / totalSessions) : 0;

    // Top subject
    const subjectMap = new Map<string, number>();
    for (const s of sessions) {
      if (s.subject) {
        subjectMap.set(
          s.subject,
          (subjectMap.get(s.subject) || 0) + s.durationSeconds
        );
      }
    }
    let topSubject: string | null = null;
    let topSubjectTime = 0;
    for (const [subject, time] of subjectMap) {
      if (time > topSubjectTime) {
        topSubject = subject;
        topSubjectTime = time;
      }
    }

    // Source distribution
    const manualSessions = sessions.filter((s) => s.source === 'MANUAL');
    const timerSessions = sessions.filter((s) => s.source === 'TIMER');
    const sourceDistribution = {
      manual: {
        count: manualSessions.length,
        totalSeconds: manualSessions.reduce(
          (sum, s) => sum + s.durationSeconds,
          0
        ),
      },
      timer: {
        count: timerSessions.length,
        totalSeconds: timerSessions.reduce(
          (sum, s) => sum + s.durationSeconds,
          0
        ),
      },
    };

    // Streak calculation
    const { currentStreak, longestStreak } = this.calculateStreaks(
      Array.from(uniqueDays).sort()
    );

    // Best day of week
    const dayOfWeekMap = new Map<number, number>();
    for (const s of sessions) {
      const day = s.studyDate.getDay();
      dayOfWeekMap.set(day, (dayOfWeekMap.get(day) || 0) + s.durationSeconds);
    }
    let bestDay: number | null = null;
    let bestDayTime = 0;
    for (const [day, time] of dayOfWeekMap) {
      if (time > bestDayTime) {
        bestDay = day;
        bestDayTime = time;
      }
    }
    const bestDayOfWeek = bestDay !== null ? DAYS_OF_WEEK[bestDay] : null;

    // Comparison with previous period
    let comparisonWithPrevious: OverviewStatistics['comparisonWithPrevious'] =
      null;
    if (dateRange) {
      const periodDays = differenceInDays(dateRange.endDate, dateRange.startDate) + 1;
      const prevStart = subDays(dateRange.startDate, periodDays);
      const prevEnd = subDays(dateRange.startDate, 1);

      const prevSessions = await prisma.studySession.findMany({
        where: {
          userId,
          studyDate: {
            gte: startOfDay(prevStart),
            lte: endOfDay(prevEnd),
          },
        },
        select: { durationSeconds: true },
      });

      const prevTotal = prevSessions.reduce(
        (sum, s) => sum + s.durationSeconds,
        0
      );
      const prevCount = prevSessions.length;

      comparisonWithPrevious = {
        totalSecondsDiff: totalSeconds - prevTotal,
        totalSessionsDiff: totalSessions - prevCount,
        percentChange:
          prevTotal > 0
            ? Math.round(((totalSeconds - prevTotal) / prevTotal) * 100)
            : null,
      };
    }

    return {
      totalSeconds,
      totalHours,
      totalSessions,
      averagePerDay,
      averagePerSession,
      topSubject,
      sourceDistribution,
      currentStreak,
      longestStreak,
      bestDayOfWeek,
      comparisonWithPrevious,
    };
  }

  async getBySubject(
    userId: string,
    query: StatisticsQuery
  ): Promise<SubjectStatistics[]> {
    const dateRange = resolveDateRange(query.period, query.startDate, query.endDate);

    const where: Prisma.StudySessionWhereInput = {
      userId,
      subject: { not: null },
      ...(dateRange && {
        studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
      }),
    };

    const sessions = await prisma.studySession.findMany({
      where,
      select: { subject: true, durationSeconds: true },
    });

    const subjectMap = new Map<
      string,
      { totalSeconds: number; totalSessions: number }
    >();

    for (const s of sessions) {
      if (!s.subject) continue;
      const current = subjectMap.get(s.subject) || {
        totalSeconds: 0,
        totalSessions: 0,
      };
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
        percentage:
          grandTotal > 0
            ? Math.round((data.totalSeconds / grandTotal) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds);
  }

  async getByDay(
    userId: string,
    query: StatisticsQuery
  ): Promise<DayStatistics[]> {
    const dateRange = resolveDateRange(
      query.period || 'month',
      query.startDate,
      query.endDate
    );

    if (!dateRange) return [];

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      select: { studyDate: true, durationSeconds: true },
    });

    const dayMap = new Map<string, { totalSeconds: number; totalSessions: number }>();

    // Initialize all days in range
    const allDays = eachDayOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate,
    });
    for (const day of allDays) {
      dayMap.set(format(day, 'yyyy-MM-dd'), {
        totalSeconds: 0,
        totalSessions: 0,
      });
    }

    for (const s of sessions) {
      const key = format(s.studyDate, 'yyyy-MM-dd');
      const current = dayMap.get(key) || { totalSeconds: 0, totalSessions: 0 };
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

  async getByWeek(
    userId: string,
    query: StatisticsQuery
  ): Promise<WeekStatistics[]> {
    const dateRange = resolveDateRange(
      query.period || 'month',
      query.startDate,
      query.endDate
    );

    if (!dateRange) return [];

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      select: { studyDate: true, durationSeconds: true },
    });

    const weekMap = new Map<
      string,
      { weekEnd: string; totalSeconds: number; totalSessions: number }
    >();

    for (const s of sessions) {
      const ws = startOfWeek(s.studyDate, { weekStartsOn: 1 });
      const we = endOfWeek(s.studyDate, { weekStartsOn: 1 });
      const key = format(ws, 'yyyy-MM-dd');
      const current = weekMap.get(key) || {
        weekEnd: format(we, 'yyyy-MM-dd'),
        totalSeconds: 0,
        totalSessions: 0,
      };
      current.totalSeconds += s.durationSeconds;
      current.totalSessions += 1;
      weekMap.set(key, current);
    }

    return Array.from(weekMap.entries())
      .map(([weekStart, data]) => ({
        weekStart,
        weekEnd: data.weekEnd,
        totalSeconds: data.totalSeconds,
        totalSessions: data.totalSessions,
      }))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  }

  async getByMonth(
    userId: string,
    query: StatisticsQuery
  ): Promise<MonthStatistics[]> {
    const dateRange = resolveDateRange(query.period, query.startDate, query.endDate);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        ...(dateRange && {
          studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
        }),
      },
      select: { studyDate: true, durationSeconds: true },
    });

    const monthMap = new Map<
      string,
      { year: number; totalSeconds: number; totalSessions: number }
    >();

    for (const s of sessions) {
      const month = format(s.studyDate, 'MMMM');
      const year = s.studyDate.getFullYear();
      const key = `${year}-${month}`;
      const current = monthMap.get(key) || {
        year,
        totalSeconds: 0,
        totalSessions: 0,
      };
      current.totalSeconds += s.durationSeconds;
      current.totalSessions += 1;
      monthMap.set(key, current);
    }

    return Array.from(monthMap.entries())
      .map(([key, data]) => ({
        month: key.split('-')[1],
        year: data.year,
        totalSeconds: data.totalSeconds,
        totalSessions: data.totalSessions,
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return 0;
      });
  }

  async getHeatmap(
    userId: string,
    query: StatisticsQuery
  ): Promise<HeatmapEntry[]> {
    // Default to last 365 days if no period specified
    const dateRange = resolveDateRange(
      query.period || 'custom',
      query.startDate || format(subDays(new Date(), 365), 'yyyy-MM-dd'),
      query.endDate || format(new Date(), 'yyyy-MM-dd')
    );

    if (!dateRange) return [];

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        studyDate: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      select: { studyDate: true, durationSeconds: true },
    });

    const dayMap = new Map<
      string,
      { totalSeconds: number; totalSessions: number }
    >();

    for (const s of sessions) {
      const key = format(s.studyDate, 'yyyy-MM-dd');
      const current = dayMap.get(key) || { totalSeconds: 0, totalSessions: 0 };
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

  // ---- Private helpers ----

  private calculateStreaks(sortedDates: string[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    if (sortedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = differenceInDays(curr, prev);

      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        tempStreak = 1;
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Check if current streak extends to today
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const lastDate = sortedDates[sortedDates.length - 1];

    if (lastDate === today || lastDate === yesterday) {
      // Recalculate from the end
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const curr = new Date(sortedDates[i + 1]);
        const prev = new Date(sortedDates[i]);
        if (differenceInDays(curr, prev) === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }

    return { currentStreak, longestStreak };
  }
}

export const statisticsService = new StatisticsService();
