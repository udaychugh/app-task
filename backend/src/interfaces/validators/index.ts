import { z } from 'zod';

// ─── Auth validators ─────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  city: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const logoutSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

// ─── User validators ──────────────────────────────────────────────────────────

export const updateCitySchema = z.object({
  city: z.string().min(1, 'City is required').max(100),
});

// ─── News validators ──────────────────────────────────────────────────────────

export const newsQuerySchema = z.object({
  city: z.string().min(1, 'City is required').max(100),
  sessionId: z.string().uuid('Invalid session ID'),
});

// ─── Pagination ───────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type UpdateCityInput = z.infer<typeof updateCitySchema>;
export type NewsQueryInput = z.infer<typeof newsQuerySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
