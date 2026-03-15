import { check } from 'express-validator';

export const validateUUID = (field: string) =>
  check(field).isUUID('4').withMessage('Invalid UUID format');
