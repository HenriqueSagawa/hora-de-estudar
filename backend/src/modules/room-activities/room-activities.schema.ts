import { z } from 'zod';

export const roomActivitiesParamSchema = z.object({
  id: z.string().min(1),
});

export const roomActivitiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).default(20).optional(),
});

export type RoomActivitiesQuery = z.infer<typeof roomActivitiesQuerySchema>;
