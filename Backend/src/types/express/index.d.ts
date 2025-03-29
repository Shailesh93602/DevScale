import { User as SupabaseUser } from '@supabase/supabase-js';
import { File } from 'express';
declare module 'express-serve-static-core' {
  interface Request {
    user: SupabaseUser;
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
