import { Response } from 'express';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: unknown;
}

export function successResponse<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: Record<string, unknown>
): void {
  const body: ApiResponse<T> = { success: true, message, data };
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
): void {
  const body: ApiResponse = { success: false, message };
  if (errors) body.errors = errors;
  res.status(statusCode).json(body);
}

export function paginationMeta(
  total: number,
  page: number,
  limit: number
): Record<string, unknown> {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
