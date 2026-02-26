import 'dotenv/config';
import { createApp } from './app';
import { prisma } from './infrastructure/database/prisma.client';
import { logger } from './shared/logger';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function bootstrap() {
  // Verify DB connection
  await prisma.$connect();
  logger.info('Database connected successfully');

  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info(`City News API running on port ${PORT}`, {
      env: process.env.NODE_ENV ?? 'development',
      port: PORT,
    });
  });

  // ── Graceful Shutdown ────────────────────────────────────────────────────

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Database disconnected. Server closed.');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', { reason });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});
