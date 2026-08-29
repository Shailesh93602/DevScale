-- ChallengeSubmission had no index at all.
--
-- PostgreSQL does not create an index for a foreign key — a common assumption,
-- and wrong. So all three real query shapes were sequential scans on a table
-- that grows with every code submission:
--
--   1. analytics.ts        where(user_id, status)      order by created_at desc
--   2. recommendationService where(user_id)            order by created_at desc
--   3. challengeRepository  where(challenge_id, status) + user_id IN (...)
--
-- Two indexes rather than three. (user_id, created_at) serves 1 and 2 and
-- returns rows already ordered, so the planner does not sort after filtering;
-- adding `status` in the middle would serve only 1 and would break 2's use of
-- created_at for ordering. Every extra index is paid for on every insert, and
-- this is a write-heavy table.
--
-- Plain CREATE INDEX, not CONCURRENTLY: Prisma runs migrations inside a
-- transaction and PostgreSQL refuses CONCURRENTLY there (SQLSTATE 25001) —
-- established by trying it against a real pg17 earlier today.
CREATE INDEX IF NOT EXISTS "ChallengeSubmission_user_id_created_at_idx"
  ON "ChallengeSubmission"("user_id", "created_at");

CREATE INDEX IF NOT EXISTS "ChallengeSubmission_challenge_id_status_idx"
  ON "ChallengeSubmission"("challenge_id", "status");
