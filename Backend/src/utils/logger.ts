import { AsyncLocalStorage } from 'node:async_hooks';
import winston from 'winston';
import { NODE_ENV } from '../config';

// ─── Request Context (AsyncLocalStorage) ─────────────────────────────────────
// Allows logger to pick up requestId from any call site within the same async
// request chain without explicitly threading it through every function.
interface RequestContext {
  requestId: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

// ─── Winston Formats ──────────────────────────────────────────────────────────
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const ctx = requestContext.getStore();
    return JSON.stringify({
      timestamp,
      level,
      message,
      requestId: ctx?.requestId,
      ...(stack ? { stack } : {}),
      ...meta,
    });
  })
);

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const ctx = requestContext.getStore();
    const reqId = ctx?.requestId ? ` [${ctx.requestId.slice(0, 8)}]` : '';
    const extra = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `${timestamp}${reqId} ${level}: ${message}${extra}`;
  })
);

// ─── Logger Instance ──────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: NODE_ENV === 'production' ? jsonFormat : devFormat,
  transports: [
    // Always write to stdout — in production containers, CloudWatch/Datadog
    // collects from stdout via log driver. No file transports needed.
    new winston.transports.Console(),
  ],
});

export default logger;
