import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';

type RequestPart = 'body' | 'query' | 'params';

export const validateRequest = (schema: Schema, type: RequestPart = 'body') => {
  // NAMED, not an anonymous arrow.
  //
  // Express records each handler's `fn.name` in the router stack, and that is
  // the only thing a contract test — or a stack trace — has to identify
  // middleware by. While this returned an anonymous arrow, "does this route
  // validate its body?" was unanswerable except by reading the source, so a
  // route silently losing its validation was undetectable by any test.
  return function validateRequest(
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    const { error, value } = schema.validate(req[type], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      logger.warn('Request validation failed', { errors });
      return next(createAppError('Validation failed', 400, { errors }));
    }

    // Replace validated content
    req[type] = value;
    next();
  };
};

// Specific validators using factory function
export const validateBody = (schema: Schema) => validateRequest(schema, 'body');
export const validateQuery = (schema: Schema) =>
  validateRequest(schema, 'query');
export const validateParams = (schema: Schema) =>
  validateRequest(schema, 'params');
