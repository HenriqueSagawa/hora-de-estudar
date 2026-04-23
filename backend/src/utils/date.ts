import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns';
import { DateRangeFilter } from '../types/common';
import { AppError } from '../errors/app-error';

export type PeriodType = 'today' | 'week' | 'month' | 'custom' | 'all';

export function resolveDateRange(
  period?: string,
  startDate?: string,
  endDate?: string
): DateRangeFilter | null {
  const now = new Date();

  switch (period) {
    case 'today':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };

    case 'week':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }),
        endDate: endOfWeek(now, { weekStartsOn: 1 }),
      };

    case 'month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };

    case 'custom':
      if (!startDate || !endDate) {
        throw new AppError(
          'startDate and endDate are required when period is "custom"',
          400
        );
      }
      return {
        startDate: startOfDay(parseISO(startDate)),
        endDate: endOfDay(parseISO(endDate)),
      };

    case 'all':
    case undefined:
      return null;

    default:
      throw new AppError(
        'Invalid period. Use: today, week, month, custom, or all',
        400
      );
  }
}
