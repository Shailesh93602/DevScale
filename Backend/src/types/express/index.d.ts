import { User, UserRole } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { File } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user: User & {
      role?: UserRole | null;
      subscription?: {
        tier?: string | null;
        status?: string | null;
        stripe_customer_id?: string | null;
        stripe_id?: string | null;
        stripe_price_id?: string | null;
        cancel_at_period_end?: boolean;
        end_date?: Date | null;
      } | null;
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
    requestId?: string;
    battle?: unknown;
    battleAccess?: {
      isCreator: boolean;
      isParticipant: boolean;
    };
  }
}
