/**
 * File upload validation middleware
 *
 * Must run AFTER multer (which populates req.file / req.files) and
 * BEFORE any middleware that touches the file content.
 *
 * Checks:
 *  - File present (if required)
 *  - MIME type in allowlist (jpeg, png, webp — no svg/gif to prevent XSS via SVG)
 *  - File size ≤ MAX_FILE_SIZE_BYTES (5 MB default)
 *
 * Usage:
 *   router.post('/avatar', multer().single('avatar'), validateFileUpload(), uploadMiddleware)
 *   router.post('/banner', multer().single('banner'), validateFileUpload({ required: false }), uploadMiddleware)
 */
import { Request, Response, NextFunction } from 'express';
import { createAppError } from '../utils/errorHandler';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface FileValidationOptions {
  required?: boolean;                        // default true
  allowedTypes?: Set<string>;                // override MIME whitelist
  maxSizeBytes?: number;                     // override size cap
}

export const validateFileUpload = (options: FileValidationOptions = {}) => {
  const {
    required = true,
    allowedTypes = ALLOWED_MIME_TYPES,
    maxSizeBytes = MAX_FILE_SIZE_BYTES,
  } = options;

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.file) {
      if (required) {
        next(createAppError('No file uploaded', 400));
        return;
      }
      next();
      return;
    }

    if (!allowedTypes.has(req.file.mimetype)) {
      next(
        createAppError(
          `File type "${req.file.mimetype}" is not allowed. Accepted: ${[...allowedTypes].join(', ')}`,
          415,
        ),
      );
      return;
    }

    if (req.file.size > maxSizeBytes) {
      next(
        createAppError(
          `File too large. Maximum size is ${Math.round(maxSizeBytes / (1024 * 1024))} MB`,
          413,
        ),
      );
      return;
    }

    next();
  };
};
