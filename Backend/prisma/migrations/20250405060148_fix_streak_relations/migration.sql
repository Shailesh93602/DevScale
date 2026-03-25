-- AlterTable
ALTER TABLE "UserProgress" ALTER COLUMN "confidence_level" SET DEFAULT NULL,
ALTER COLUMN "progress_percentage" SET DEFAULT NULL;

-- RenameForeignKey
ALTER TABLE "user_daily_activities" RENAME CONSTRAINT "user_daily_activities_streak_fkey" TO "user_daily_activities_streak_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_daily_activities" RENAME CONSTRAINT "user_daily_activities_user_fkey" TO "user_daily_activities_user_id_fkey";
