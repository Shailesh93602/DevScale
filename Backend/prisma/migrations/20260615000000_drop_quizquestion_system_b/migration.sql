-- Remove the redundant "System B" question tables.
-- Battles + quizzes now share the canonical Question/Option tables; these
-- parallel tables had no functional readers (see questionPoolService unify).
-- Drop in dependency order (children first).

DROP TABLE IF EXISTS "QuizSubmissionAnswer";
DROP TABLE IF EXISTS "QuizAnswer";
DROP TABLE IF EXISTS "QuizOption";
DROP TABLE IF EXISTS "QuizQuestion";
