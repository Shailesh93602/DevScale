export class DatabaseError extends Error {
  status?: number;
  code?: string;
  data?: unknown;

  constructor(message: string, status?: number, code?: string, data?: unknown) {
    super(message);
    this.name = 'DatabaseError';
    this.status = status;
    this.code = code;
    this.data = data;
    Error.captureStackTrace(this, DatabaseError);
  }
}

export class ValidationError extends Error {
  status: number;
  code?: string;
  data?: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.data = data;
    Error.captureStackTrace(this, ValidationError);
  }
}

export class AuthenticationError extends Error {
  status: number;
  code?: string;

  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
    Error.captureStackTrace(this, AuthenticationError);
  }
}
