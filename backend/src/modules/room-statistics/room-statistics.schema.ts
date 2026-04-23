import { z } from 'zod';

export const roomStatsParamSchema = z.object({
  id: z.string().min(1),
});

export const roomStatsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom', 'all']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type RoomStatsQuery = z.infer<typeof roomStatsQuerySchema>;
