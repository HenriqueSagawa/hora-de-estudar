import { z } from 'zod';

export const statisticsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom', 'all']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type StatisticsQuery = z.infer<typeof statisticsQuerySchema>;
