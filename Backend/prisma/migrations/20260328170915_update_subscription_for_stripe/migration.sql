/*
  Warnings:

  - The values [UPCOMING,ARCHIVED] on the enum `BattleStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [INSTANT,TOURNAMENT] on the enum `BattleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `end_time` on the `Battle` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `Battle` table. All the data in the column will be lost.
  - You are about to drop the column `answer` on the `BattleAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `time_taken` on the `BattleAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `time_taken` on the `BattleLeaderboard` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Battle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `MainConcept` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Roadmap` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_id]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_customer_id]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `battle_id` to the `BattleAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selected_option` to the `BattleAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_taken_ms` to the `BattleAnswer` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `correct_answer` on the `BattleQuestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BattleParticipantStatus" AS ENUM ('JOINED', 'READY', 'PLAYING', 'COMPLETED', 'DISCONNECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "BattleStatus_new" AS ENUM ('WAITING', 'LOBBY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Battle" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Battle" ALTER COLUMN "status" TYPE "BattleStatus_new" USING ("status"::text::"BattleStatus_new");
ALTER TYPE "BattleStatus" RENAME TO "BattleStatus_old";
ALTER TYPE "BattleStatus_new" RENAME TO "BattleStatus";
DROP TYPE "BattleStatus_old";
ALTER TABLE "Battle" ALTER COLUMN "status" SET DEFAULT 'WAITING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "BattleType_new" AS ENUM ('QUICK', 'SCHEDULED', 'PRACTICE');
ALTER TABLE "Battle" ALTER COLUMN "type" TYPE "BattleType_new" USING ("type"::text::"BattleType_new");
ALTER TYPE "BattleType" RENAME TO "BattleType_old";
ALTER TYPE "BattleType_new" RENAME TO "BattleType";
DROP TYPE "BattleType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ChallengeCategory" ADD VALUE 'machine_learning';
ALTER TYPE "ChallengeCategory" ADD VALUE 'devops';
ALTER TYPE "ChallengeCategory" ADD VALUE 'security';
ALTER TYPE "ChallengeCategory" ADD VALUE 'frontend';
ALTER TYPE "ChallengeCategory" ADD VALUE 'backend';
ALTER TYPE "ChallengeCategory" ADD VALUE 'mobile';
ALTER TYPE "ChallengeCategory" ADD VALUE 'concurrency';
ALTER TYPE "ChallengeCategory" ADD VALUE 'mathematics';
ALTER TYPE "ChallengeCategory" ADD VALUE 'bit_manipulation';
ALTER TYPE "ChallengeCategory" ADD VALUE 'strings';

-- DropForeignKey
ALTER TABLE "Battle" DROP CONSTRAINT "Battle_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_user_id_fkey";

-- DropIndex
DROP INDEX "BattleLeaderboard_score_idx";

-- DropIndex
DROP INDEX "Challenge_topic_id_idx";

-- AlterTable
ALTER TABLE "Battle" DROP COLUMN "end_time",
DROP COLUMN "length",
ADD COLUMN     "ended_at" TIMESTAMP(3),
ADD COLUMN     "question_source_id" TEXT,
ADD COLUMN     "question_source_type" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "winner_id" TEXT,
ALTER COLUMN "status" SET DEFAULT 'WAITING',
ALTER COLUMN "topic_id" DROP NOT NULL,
ALTER COLUMN "max_participants" SET DEFAULT 6,
ALTER COLUMN "points_per_question" SET DEFAULT 100;

-- AlterTable
ALTER TABLE "BattleAnswer" DROP COLUMN "answer",
DROP COLUMN "time_taken",
ADD COLUMN     "battle_id" TEXT NOT NULL,
ADD COLUMN     "points_earned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "selected_option" INTEGER NOT NULL,
ADD COLUMN     "time_taken_ms" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "BattleLeaderboard" DROP COLUMN "time_taken",
ADD COLUMN     "correct_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_time_ms" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BattleParticipant" ADD COLUMN     "avg_time_per_answer_ms" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "correct_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_seen_at" TIMESTAMP(3),
ADD COLUMN     "status" "BattleParticipantStatus" NOT NULL DEFAULT 'JOINED',
ADD COLUMN     "wrong_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BattleQuestion" ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "source_challenge_id" TEXT,
ADD COLUMN     "source_quiz_question_id" TEXT,
DROP COLUMN "correct_answer",
ADD COLUMN     "correct_answer" INTEGER NOT NULL,
ALTER COLUMN "points" SET DEFAULT 100;

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "boilerplates" JSONB,
ADD COLUMN     "company_tags" TEXT[],
ADD COLUMN     "editorial" TEXT,
ADD COLUMN     "hints" TEXT[],
ALTER COLUMN "topic_id" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "MainConcept" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "features",
ADD COLUMN     "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT DEFAULT 'incomplete',
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_id" TEXT,
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "tier" SET DEFAULT 'free',
ALTER COLUMN "start_date" DROP NOT NULL,
ALTER COLUMN "start_date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "end_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "ChallengeDraft" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChallengeDraft_user_id_challenge_id_idx" ON "ChallengeDraft"("user_id", "challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeDraft_user_id_challenge_id_language_key" ON "ChallengeDraft"("user_id", "challenge_id", "language");

-- CreateIndex
CREATE INDEX "Achievement_user_id_earned_at_idx" ON "Achievement"("user_id", "earned_at");

-- CreateIndex
CREATE UNIQUE INDEX "Battle_slug_key" ON "Battle"("slug");

-- CreateIndex
CREATE INDEX "Battle_winner_id_idx" ON "Battle"("winner_id");

-- CreateIndex
CREATE INDEX "Battle_status_created_at_idx" ON "Battle"("status", "created_at");

-- CreateIndex
CREATE INDEX "Battle_user_id_status_idx" ON "Battle"("user_id", "status");

-- CreateIndex
CREATE INDEX "BattleAnswer_battle_id_idx" ON "BattleAnswer"("battle_id");

-- CreateIndex
CREATE INDEX "BattleAnswer_battle_id_user_id_idx" ON "BattleAnswer"("battle_id", "user_id");

-- CreateIndex
CREATE INDEX "BattleLeaderboard_battle_id_score_idx" ON "BattleLeaderboard"("battle_id", "score");

-- CreateIndex
CREATE INDEX "BattleQuestion_battle_id_order_idx" ON "BattleQuestion"("battle_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_title_key" ON "Challenge"("title");

-- CreateIndex
CREATE INDEX "Challenge_category_idx" ON "Challenge"("category");

-- CreateIndex
CREATE INDEX "Challenge_status_idx" ON "Challenge"("status");

-- CreateIndex
CREATE INDEX "Enrollment_user_id_status_idx" ON "Enrollment"("user_id", "status");

-- CreateIndex
CREATE INDEX "ForumComment_post_id_created_at_idx" ON "ForumComment"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "ForumPost_forum_id_created_at_idx" ON "ForumPost"("forum_id", "created_at");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_subject_id_score_idx" ON "LeaderboardEntry"("subject_id", "score");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_subject_id_created_at_idx" ON "LeaderboardEntry"("subject_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "MainConcept_slug_key" ON "MainConcept"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_slug_key" ON "Roadmap"("slug");

-- CreateIndex
CREATE INDEX "Roadmap_is_public_popularity_idx" ON "Roadmap"("is_public", "popularity");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_user_id_key" ON "Subscription"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripe_id_key" ON "Subscription"("stripe_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripe_customer_id_key" ON "Subscription"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "Subscription_user_id_idx" ON "Subscription"("user_id");

-- CreateIndex
CREATE INDEX "Subscription_stripe_id_idx" ON "Subscription"("stripe_id");

-- CreateIndex
CREATE INDEX "Subscription_stripe_customer_id_idx" ON "Subscription"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "UserActivityLog_user_id_timestamp_idx" ON "UserActivityLog"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "UserProgress_user_id_is_completed_idx" ON "UserProgress"("user_id", "is_completed");

-- CreateIndex
CREATE INDEX "UserRoadmap_user_id_created_at_idx" ON "UserRoadmap"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_daily_activities_user_id_idx" ON "user_daily_activities"("user_id");

-- CreateIndex
CREATE INDEX "user_daily_activities_user_id_created_at_idx" ON "user_daily_activities"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleAnswer" ADD CONSTRAINT "BattleAnswer_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeDraft" ADD CONSTRAINT "ChallengeDraft_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeDraft" ADD CONSTRAINT "ChallengeDraft_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
