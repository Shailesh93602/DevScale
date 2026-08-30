-- Per-user permission overrides: effect, expiry, and provenance.
--
-- ADDITIVE ONLY. Every column is nullable or carries a default, so existing
-- rows remain valid and no data is rewritten. `user_permissions` is empty in
-- every environment today (the table was never read), but the migration is
-- written as though it were not.
--
-- effect defaults to ALLOW so that any row created before this migration, and
-- any client that does not yet send the field, keeps its previous meaning:
-- before this change the only thing a row could express was a grant.

-- AlterTable
ALTER TABLE "user_permissions" ADD COLUMN "effect" TEXT NOT NULL DEFAULT 'ALLOW';
ALTER TABLE "user_permissions" ADD COLUMN "expires_at" TIMESTAMP(3);
ALTER TABLE "user_permissions" ADD COLUMN "granted_by" TEXT;
ALTER TABLE "user_permissions" ADD COLUMN "reason" TEXT;

-- CreateIndex
CREATE INDEX "user_permissions_user_id_expires_at_idx" ON "user_permissions"("user_id", "expires_at");
