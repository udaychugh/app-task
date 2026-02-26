import { Request, Response, NextFunction } from 'express';
import { logger } from '../../shared/logger';

export function masterLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const originalUrl = req.originalUrl;
  const method = req.method;

  const routeIdentifier = () => {
    try {
      const base = req.baseUrl ?? '';
      const routePath = (req.route && (req.route as any).path) ? (req.route as any).path : req.path;
      return `${base}${routePath}`;
    } catch {
      return req.path;
    }
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const error = status >= 400 ? res.statusMessage : undefined;

    logger.info('HTTP request completed', {
      method,
      route: routeIdentifier(),
      originalUrl,
      status,
      durationMs: duration,
      ip: req.ip,
      error,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}

export default masterLogMiddleware;
