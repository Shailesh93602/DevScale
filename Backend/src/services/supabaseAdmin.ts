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
  // Supabase's new key system: SUPABASE_SECRET_KEY (sb_secret_…) replaces the
  // legacy service_role key and has the same admin privileges. Prefer it; fall
  // back to the legacy var for older environments.
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
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

/** Why a sync did not happen, when it did not. */
export type RoleSyncResult =
  | { synced: true }
  | {
      synced: false;
      reason: 'not-configured' | 'missing-identity' | 'failed';
      detail?: string;
    };

/**
 * Mirror a user's role into Supabase `app_metadata.role`.
 *
 * The edge middleware gates /admin on `app_metadata.role` — it cannot read our
 * database — so the authoritative DB role must be mirrored here whenever it
 * changes. If it is not, the DB and the gate disagree.
 *
 * WHY THIS RETURNS A RESULT INSTEAD OF SWALLOWING FAILURE.
 *
 * It used to log a warning and return void, which was defensible while the gate
 * had a fallback: a stale claim degraded to reading `user_metadata` and the
 * admin still got in. That fallback was a privilege escalation and is gone, so
 * the gate now fails CLOSED — and the consequence of a silent sync failure
 * changed completely.
 *
 * Today, a failed sync means a user who was just granted ADMIN, and told so,
 * **cannot reach /admin at all**. The database says one thing and the gate says
 * another, with nothing anywhere reporting the disagreement.
 *
 * A half-applied privilege grant is worse than a refused one, so the caller is
 * given what it needs to refuse. Removing a fallback quietly moves risk into
 * whatever depended on it.
 */
export async function syncSupabaseUserRole(
  supabaseId: string | null | undefined,
  roleName: string | null | undefined
): Promise<RoleSyncResult> {
  const admin = getAdminClient();
  if (!admin) {
    logger.warn(
      'SUPABASE_SECRET_KEY not set — skipping app_metadata role sync (the /admin gate will be stale)'
    );
    return { synced: false, reason: 'not-configured' };
  }
  if (!supabaseId || !roleName) {
    return { synced: false, reason: 'missing-identity' };
  }

  const { error } = await admin.auth.admin.updateUserById(supabaseId, {
    app_metadata: { role: roleName.toUpperCase() },
  });
  if (error) {
    logger.error('Failed to sync Supabase app_metadata.role', {
      error: error.message,
      supabaseId,
    });
    return { synced: false, reason: 'failed', detail: error.message };
  }

  logger.info('Synced Supabase app_metadata.role', { supabaseId, roleName });
  return { synced: true };
}
