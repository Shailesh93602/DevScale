/**
 * Startup environment validation.
 * Called once at process start — crashes immediately if required vars are
 * missing or malformed, before any connections are attempted.
 *
 * Import this at the very top of main.ts and app.logic.ts (after instrument.ts). 
 */

import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  // ── App ──────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid postgresql:// URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid postgresql:// URL'),

  // ── Supabase ──────────────────────────────────────────────────────────────
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid https:// URL'),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(10, 'SUPABASE_PUBLISHABLE_KEY is missing'),
  SUPABASE_JWT_SIGNING_KEY: z.string().optional().or(z.literal('')),

  // ── Redis ─────────────────────────────────────────────────────────────────
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // ── Cloudinary ────────────────────────────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal('')),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal('')),
  CLOUDINARY_API_SECRET: z.string().optional().or(z.literal('')),

  // ── CORS ──────────────────────────────────────────────────────────────────
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),

  // ── Optional (warn if missing in prod) ────────────────────────────────────
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  API_URL: z.string().url().optional().or(z.literal('')),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  COMPILER_CLIENT_SECRET: z.string().optional(),
  COMPILER_CLIENT_ID: z.string().optional(),
  ACCESS_TOKEN_SECRET: z.string().optional(),
  RESET_TOKEN_SECRET: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().optional(),
  WS_URL: z.string().optional(),
  MAIL_ADDRESS: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  ALERT_EMAIL: z.string().email().optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues || [];
    const errorsList = issues
      .map((e) => `  • ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    // Write directly to stderr — logger may not be ready yet
    process.stderr.write(
      `\n[FATAL] Missing or invalid environment variables:\n${errorsList}\n\n` +
      `Copy Backend/.env.example to Backend/.env and fill in the required values.\n\n`,
    );
    process.exit(1);
  }

  const env = result.data;

  // Warn in production if optional-but-important vars are absent
  if (env.NODE_ENV === 'production') {
    const productionWarnings: string[] = [];
    if (!env.SENTRY_DSN) productionWarnings.push('SENTRY_DSN (error tracking disabled)');
    if (!env.SMTP_HOST) productionWarnings.push('SMTP_HOST (email delivery disabled)');
    if (!env.COMPILER_CLIENT_SECRET) productionWarnings.push('COMPILER_CLIENT_SECRET (code execution disabled)');

    if (productionWarnings.length > 0) {
      process.stderr.write(
        `\n[WARN] Running in production with optional features disabled:\n` +
        productionWarnings.map((w) => `  • ${w}`).join('\n') + '\n\n',
      );
    }
  }

  return env;
}

// Validate once and export the typed, coerced result
export const env = validateEnv();
