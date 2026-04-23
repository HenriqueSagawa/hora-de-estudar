import { z } from 'zod';

export const rankingQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom', 'all']).default('all').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  source: z.enum(['all', 'MANUAL', 'TIMER']).default('all').optional(),
});

export const rankingParamSchema = z.object({
  id: z.string().min(1),
});

export type RankingQuery = z.infer<typeof rankingQuerySchema>;
