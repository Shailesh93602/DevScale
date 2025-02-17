import axios from 'axios';

export class HttpError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export const handleHttpError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    throw new HttpError(
      error.message,
      error.response?.status || 500,
      error.response?.data,
    );
  }
  throw new HttpError('Unknown error occurred', 500);
};
