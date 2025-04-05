/*
  Warnings:

  - You are about to drop the `UserDailyActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserStreak` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserDailyActivity" DROP CONSTRAINT "UserDailyActivity_streak_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDailyActivity" DROP CONSTRAINT "UserDailyActivity_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserStreak" DROP CONSTRAINT "UserStreak_user_id_fkey";

-- AlterTable
ALTER TABLE "UserProgress" ALTER COLUMN "confidence_level" SET DEFAULT NULL,
ALTER COLUMN "progress_percentage" SET DEFAULT NULL;

-- DropTable
DROP TABLE "UserDailyActivity";

-- DropTable
DROP TABLE "UserStreak";

-- CreateTable
CREATE TABLE "user_streaks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" TIMESTAMP(3),
    "streak_start_date" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'UTC',

    CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_daily_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_type" "ActivityType" NOT NULL,
    "minutes_spent" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_daily_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_streaks_user_id_key" ON "user_streaks"("user_id");

-- AddForeignKey
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_daily_activities" ADD CONSTRAINT "user_daily_activities_user_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_daily_activities" ADD CONSTRAINT "user_daily_activities_streak_fkey" FOREIGN KEY ("user_id") REFERENCES "user_streaks"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
