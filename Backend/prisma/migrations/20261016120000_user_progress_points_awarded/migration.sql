-- Topic-completion points are paid once per (user, topic). The flag lets a
-- learner un-complete and re-complete a topic without being paid again.
--
-- Additive. Rows already completed are treated as paid: the old endpoint paid
-- on every completion, so marking them unpaid would let them be paid again.
ALTER TABLE "UserProgress" ADD COLUMN IF NOT EXISTS "points_awarded" BOOLEAN NOT NULL DEFAULT false;
UPDATE "UserProgress" SET "points_awarded" = true WHERE "is_completed" = true;
