import 'express';
import { File } from 'express';
import { Prisma } from '@prisma/client';
declare global {
  namespace Express {
    interface Request {
      user: Prisma.User;
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
      apiVersion?: string;
    }
  }
}
