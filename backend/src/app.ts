import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { env } from './config/env';
import { apiRouter } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

// ---- Logger ----
const logger = pino({
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

// ---- Security ----
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// ---- Request logging ----
app.use(
  pinoHttp({
    logger,
    quietReqLogger: true,
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
      if (res.statusCode >= 500 || err) return 'error';
      return 'info';
    },
  })
);

// ---- Body parsing ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Health check ----
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ---- API Routes ----
app.use('/api', apiRouter);

// ---- 404 handler ----
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---- Global error handler ----
app.use(errorMiddleware);

export { app, logger };
