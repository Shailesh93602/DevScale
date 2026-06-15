import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

/**
 * Service-role Supabase client for privileged operations (e.g. writing
 * app_metadata). Lazily created. Returns null when the service key isn't
 * configured so callers degrade gracefully instead of crashing.
 */
let adminClient: SupabaseClient | null = null;
function getAdminClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  adminClient ??= createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}

/** True when the service-role key is configured (so role-sync can work). */
export function isSupabaseAdminConfigured(): boolean {
  return getAdminClient() !== null;
}

/**
 * Mirror a user's role into Supabase `app_metadata.role`.
 *
 * The edge middleware gates /admin on `app_metadata.role` (it can't read our
 * DB), so the authoritative DB role must be mirrored here whenever it changes —
 * otherwise the DB role and the gate drift and admins can't reach /admin.
 *
 * No-op (with a warning) when the service key isn't set, so role updates still
 * succeed in environments without it.
 */
export async function syncSupabaseUserRole(
  supabaseId: string | null | undefined,
  roleName: string | null | undefined
): Promise<void> {
  const admin = getAdminClient();
  if (!admin) {
    logger.warn(
      'SUPABASE_SERVICE_ROLE_KEY not set — skipping app_metadata role sync (admin gate may be stale)'
    );
    return;
  }
  if (!supabaseId || !roleName) return;

  const { error } = await admin.auth.admin.updateUserById(supabaseId, {
    app_metadata: { role: roleName.toUpperCase() },
  });
  if (error) {
    logger.error('Failed to sync Supabase app_metadata.role', {
      error: error.message,
      supabaseId,
    });
  } else {
    logger.info('Synced Supabase app_metadata.role', { supabaseId, roleName });
  }
}
