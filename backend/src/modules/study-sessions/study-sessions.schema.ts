import { z } from 'zod';

// ---- Manual Session ----
export const createManualSessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  description: z.string().max(1000).trim().nullable().optional(),
  subject: z.string().max(100).trim().nullable().optional(),
  studyType: z.string().max(100).trim().nullable().optional(),
  durationSeconds: z.number().int().min(1, 'Duration must be at least 1 second'),
  studyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'studyDate must be YYYY-MM-DD format'),
  focusLevel: z.number().int().min(1).max(5).nullable().optional(),
  roomId: z.string().nullable().optional(),
});

// ---- Timer ----
export const startTimerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  description: z.string().max(1000).trim().nullable().optional(),
  subject: z.string().max(100).trim().nullable().optional(),
  studyType: z.string().max(100).trim().nullable().optional(),
  roomId: z.string().nullable().optional(),
});

export const finishTimerSchema = z.object({
  focusLevel: z.number().int().min(1).max(5).nullable().optional(),
});

// ---- Update Session ----
export const updateSessionSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().nullable().optional(),
  subject: z.string().max(100).trim().nullable().optional(),
  studyType: z.string().max(100).trim().nullable().optional(),
  focusLevel: z.number().int().min(1).max(5).nullable().optional(),
});

// ---- ID Param ----
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// ---- List Sessions Query ----
export const listSessionsSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom', 'all']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  subject: z.string().optional(),
  source: z.enum(['MANUAL', 'TIMER']).optional(),
  roomId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(10).optional(),
  orderBy: z.enum(['studyDate', 'durationSeconds', 'createdAt']).default('createdAt').optional(),
  orderDirection: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type CreateManualSessionInput = z.infer<typeof createManualSessionSchema>;
export type StartTimerInput = z.infer<typeof startTimerSchema>;
export type FinishTimerInput = z.infer<typeof finishTimerSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type ListSessionsInput = z.infer<typeof listSessionsSchema>;
