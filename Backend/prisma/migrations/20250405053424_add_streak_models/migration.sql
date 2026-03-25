-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('TOPIC_COMPLETION', 'QUIZ_COMPLETION', 'CODE_CHALLENGE', 'RESOURCE_STUDY', 'PRACTICE_SESSION');

-- AlterTable
ALTER TABLE "UserProgress" ALTER COLUMN "confidence_level" SET DEFAULT NULL,
ALTER COLUMN "progress_percentage" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "UserStreak" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" TIMESTAMP(3),
    "streak_start_date" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'UTC',

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDailyActivity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "streak_id" TEXT NOT NULL,
    "activity_date" TIMESTAMP(3) NOT NULL,
    "minutes_spent" INTEGER NOT NULL,
    "activity_type" "ActivityType" NOT NULL,
    "timezone_offset" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserDailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserStreak_user_id_key" ON "UserStreak"("user_id");

-- CreateIndex
CREATE INDEX "UserDailyActivity_user_id_idx" ON "UserDailyActivity"("user_id");

-- CreateIndex
CREATE INDEX "UserDailyActivity_streak_id_idx" ON "UserDailyActivity"("streak_id");

-- CreateIndex
CREATE INDEX "UserDailyActivity_activity_date_idx" ON "UserDailyActivity"("activity_date");

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyActivity" ADD CONSTRAINT "UserDailyActivity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyActivity" ADD CONSTRAINT "UserDailyActivity_streak_id_fkey" FOREIGN KEY ("streak_id") REFERENCES "UserStreak"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
