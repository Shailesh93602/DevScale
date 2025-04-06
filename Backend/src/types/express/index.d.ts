import { User, UserRole } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { File } from 'express';
import { File, Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user: User & {
      role?: UserRole | null;
    };
    supabaseUser: SupabaseUser;
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
    timezone?: string;
  }
}
