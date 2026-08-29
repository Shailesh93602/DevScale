-- Indexes for the audit trails.
--
-- None of these tables had an index on created_at, yet every read orders by it
-- and the new retention job filters on it. Both were full sequential scans on
-- tables that, by design, only ever grow.
--
-- WHY NOT `CONCURRENTLY`.
--
-- It is the right instinct — these tables are written on every privileged
-- action, and a plain CREATE INDEX takes a write lock for the duration. But
-- Prisma Migrate runs each migration inside a transaction, and PostgreSQL
-- refuses CREATE INDEX CONCURRENTLY there:
--
--   ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block
--   (SQLSTATE 25001)
--
-- That is not a guess. It was tried, and the deploy failed against a real
-- PostgreSQL 17 before this file was rewritten — which would have broken
-- production, since migrations now run on every deploy.
--
-- A plain CREATE INDEX is acceptable HERE specifically because these tables are
-- currently near-empty: five of the thirteen log models were never written to
-- at all, and AdminAuditLog had a single call site. The lock is measured in
-- milliseconds today. If that stops being true, the index must be built out of
-- band (psql, outside Prisma) rather than by relaxing this note.
CREATE INDEX IF NOT EXISTS "AdminAuditLog_created_at_idx"
  ON "AdminAuditLog"("created_at");

-- "What did this admin do recently" — returns rows already ordered, so the
-- planner does not have to sort after filtering.
CREATE INDEX IF NOT EXISTS "AdminAuditLog_admin_id_created_at_idx"
  ON "AdminAuditLog"("admin_id", "created_at");

-- Security events are kept a year (vs 90 days for routine admin actions), so
-- this is the largest of the trails and the one where a scan hurts most.
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_created_at_idx"
  ON "SecurityAuditLog"("created_at");

-- getChangeHistory filters entity + entity_id together and orders by time. The
-- three existing single-column indexes can be combined by the planner, but the
-- result still has to be sorted; this composite answers the whole query.
CREATE INDEX IF NOT EXISTS "ChangeHistory_entity_entity_id_created_at_idx"
  ON "ChangeHistory"("entity", "entity_id", "created_at");
