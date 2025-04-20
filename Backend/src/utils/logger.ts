import fs from 'fs';
import os from 'os';
import path from 'path';
import winston from 'winston';
import TransportStream from 'winston-transport';
import { NODE_ENV } from '../config';

// Determine base directory for logs
const isServerless = !!process.env.VERCEL;
const baseDir = isServerless
  ? path.join(os.tmpdir(), 'logs')
  : path.join(process.cwd(), 'logs');

// Ensure local log directory exists
if (!isServerless && !fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Define file transports
const fileTransports: TransportStream[] = [
  new winston.transports.File({
    filename: path.join(baseDir, 'error.log'),
    level: 'error',
  }),
  new winston.transports.File({
    filename: path.join(baseDir, 'combined.log'),
  }),
];

// Define console transport
const consoleTransport: TransportStream = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
});

// Choose transports based on environment
const transports: TransportStream[] =
  NODE_ENV === 'production'
    ? isServerless
      ? [] // Skip file transports on Vercel, rely on console
      : fileTransports
    : [...fileTransports, consoleTransport];

// Create logger
const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

export default logger;
