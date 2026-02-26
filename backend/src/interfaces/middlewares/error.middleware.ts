import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors';
import { errorResponse } from '../../shared/utils/response.util';
import { logger } from '../../shared/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational error', { error: err.message, stack: err.stack });
    }
    errorResponse(res, err.message, err.statusCode);
    return;
  }

  // Unexpected errors
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  errorResponse(res, message, 500);
}

export function notFoundHandler(req: Request, res: Response): void {
  errorResponse(res, `Route ${req.method} ${req.path} not found`, 404);
}
