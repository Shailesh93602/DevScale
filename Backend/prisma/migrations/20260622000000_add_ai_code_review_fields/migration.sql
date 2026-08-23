-- AI Code Review: extend CodeReview so AI-generated reviews can be persisted.
-- Data-preserving: reviewer_id becomes nullable (AI reviews have no human
-- reviewer), and new columns are nullable or defaulted. updated_at is added with
-- a default so existing rows get a valid value.

-- DropForeignKey
ALTER TABLE "CodeReview" DROP CONSTRAINT "CodeReview_reviewer_id_fkey";

-- AlterTable
ALTER TABLE "CodeReview" ADD COLUMN     "model" TEXT,
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'human',
ADD COLUMN     "submission_id" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "reviewer_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CodeReview_submission_id_idx" ON "CodeReview"("submission_id");

-- CreateIndex
CREATE INDEX "CodeReview_author_id_source_idx" ON "CodeReview"("author_id", "source");

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
