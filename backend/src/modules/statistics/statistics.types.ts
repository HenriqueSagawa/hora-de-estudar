export interface OverviewStatistics {
  totalSeconds: number;
  totalHours: number;
  totalSessions: number;
  averagePerDay: number;
  averagePerSession: number;
  topSubject: string | null;
  sourceDistribution: {
    manual: { count: number; totalSeconds: number };
    timer: { count: number; totalSeconds: number };
  };
  currentStreak: number;
  longestStreak: number;
  bestDayOfWeek: string | null;
  comparisonWithPrevious: {
    totalSecondsDiff: number;
    totalSessionsDiff: number;
    percentChange: number | null;
  } | null;
}

export interface SubjectStatistics {
  subject: string;
  totalSeconds: number;
  totalHours: number;
  totalSessions: number;
  percentage: number;
}

export interface DayStatistics {
  date: string;
  totalSeconds: number;
  totalSessions: number;
}

export interface WeekStatistics {
  weekStart: string;
  weekEnd: string;
  totalSeconds: number;
  totalSessions: number;
}

export interface MonthStatistics {
  month: string;
  year: number;
  totalSeconds: number;
  totalSessions: number;
}

export interface HeatmapEntry {
  date: string;
  totalSeconds: number;
  totalSessions: number;
}
