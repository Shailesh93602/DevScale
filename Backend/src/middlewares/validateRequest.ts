import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { createAppError } from '../utils/errorHandler';

type RequestPart = 'body' | 'query' | 'params';

export const validateRequest = (schema: Schema, type: RequestPart = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
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

      console.error('Validation errors:', errors);
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
