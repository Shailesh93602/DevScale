import { Role, User } from '@prisma/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { File } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    // 🔴 `Role`, not `UserRole`. `UserRole` is not a type `@prisma/client`
    // exports — the model in schema.prisma is `Role` — so this import could
    // never resolve. `tsconfig.json` sets `skipLibCheck: true`, which does not
    // report a DECLARATION file's own errors, so the broken import was
    // swallowed and `role` silently degraded to `any` for every consumer:
    // `req.user.role.doesNotExist` type-checked clean across the whole repo.
    //
    // That is what let `assertOwnership` ship `req.user.role === 'ADMIN'` —
    // an object compared to a string — with the compiler unable to say a word.
    // Verified both ways before and after this change with a probe file.
    user: User & {
      role?: Role | null;
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
