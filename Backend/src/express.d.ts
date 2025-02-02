import 'express';
import { File } from 'express';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        name?: string;
        email: string;
      };
      pagination: {
        page: number;
        limit: number;
        offset: number;
        search?: string;
        order?: string;
        orderBy?: string;
      };
      fileUrl?: string;
      file: File;
    }
  }
}
