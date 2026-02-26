import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import routes from './interfaces/routes';
import { errorHandler, notFoundHandler } from './interfaces/middlewares/error.middleware';
import { logger } from './shared/logger';
import masterLogMiddleware from './interfaces/middlewares/masterLog.middleware';

export function createApp(): Application {
  const app = express();

  // ── Security headers ─────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use(limiter);

  // ── Body parsers ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Request logging (master) ──────────────────────────────────────────────
  app.use(masterLogMiddleware);

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API Routes ────────────────────────────────────────────────────────────
  app.use('/api', routes);

  // ── 404 & Error Handlers ─────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
