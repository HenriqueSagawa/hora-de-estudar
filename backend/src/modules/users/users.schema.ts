import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim()
    .optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      'Username can only contain letters, numbers, underscores, dots, and hyphens'
    )
    .trim()
    .toLowerCase()
    .optional(),
  avatarUrl: z.string().url('Invalid URL').nullable().optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').nullable().optional(),
  institution: z.string().max(200).nullable().optional(),
  course: z.string().max(200).nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one digit'
    ),
});

export const searchUsersSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).default(10).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
