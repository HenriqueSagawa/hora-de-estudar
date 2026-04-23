import { app, logger } from './app';
import { env } from './config/env';
import { prisma } from './database/prisma';

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API: http://localhost:${env.PORT}/api`);
      logger.info(`❤️  Health: http://localhost:${env.PORT}/health`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(
          `❌ Port ${env.PORT} is already in use. Kill the process with: lsof -ti:${env.PORT} | xargs kill -9`
        );
      } else {
        logger.error(err, '❌ Server error');
      }
      void prisma.$disconnect().finally(() => process.exit(1));
    });
  } catch (error) {
    logger.error(error, '❌ Failed to start server');
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Shutting down gracefully...');
  void prisma.$disconnect().finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Shutting down gracefully...');
  void prisma.$disconnect().finally(() => process.exit(0));
});

void main();
