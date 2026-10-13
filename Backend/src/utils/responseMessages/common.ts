import type { ResponseConfig } from './types.js';

/** Generic auth / validation outcomes shared by every route. */
export const commonMessages = {
  INVALID_PAYLOAD: {
    status: 400,
    success: false,
    message: 'Invalid payload provided',
  },
  UNAUTHORIZED: {
    status: 401,
    success: false,
    message: 'Unauthorized',
  },
  FORBIDDEN: {
    status: 403,
    success: false,
    message: 'Forbidden',
  },
  NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Not found',
  },
} satisfies Record<string, ResponseConfig>;
