-- One AI review per submission, enforced by the database rather than by a read.
--
-- The application does findFirst-then-create, which is a check-then-act: two
-- concurrent requests for the same submission both miss the read, both call the
-- LLM, and both insert. This makes the second insert fail instead, and the
-- application recovers from the violation by returning the winner's row.
--
-- Safe on existing data: submission_id is NULL for every human peer review, and
-- Postgres treats each NULL as distinct in a unique index, so those rows never
-- collide with each other.
--
-- Defensive: if any duplicate AI rows were created before this constraint
-- existed, keep the oldest and drop the rest. Without this the migration fails
-- on a production database that already raced.
DELETE FROM "CodeReview" a
USING "CodeReview" b
WHERE a."submission_id" IS NOT NULL
  AND a."submission_id" = b."submission_id"
  AND a."source" = b."source"
  AND a."created_at" > b."created_at";

CREATE UNIQUE INDEX "CodeReview_submission_id_source_key"
  ON "CodeReview"("submission_id", "source");
