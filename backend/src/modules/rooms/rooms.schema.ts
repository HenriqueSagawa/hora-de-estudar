import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  description: z.string().max(500).trim().nullable().optional(),
  coverImageUrl: z.string().url('Invalid URL').nullable().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'INVITE_ONLY']).default('PRIVATE'),
});

export const updateRoomSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(500).trim().nullable().optional(),
  coverImageUrl: z.string().url('Invalid URL').nullable().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'INVITE_ONLY']).optional(),
});

export const roomIdParamSchema = z.object({
  id: z.string().min(1),
});

export const inviteCodeParamSchema = z.object({
  inviteCode: z.string().min(1),
});

export const memberParamSchema = z.object({
  id: z.string().min(1),
  memberUserId: z.string().min(1),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

export const listRoomsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).default(10).optional(),
  search: z.string().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type ListRoomsInput = z.infer<typeof listRoomsSchema>;
