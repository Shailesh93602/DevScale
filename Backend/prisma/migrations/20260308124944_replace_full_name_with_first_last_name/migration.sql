/*
  Warnings:

  - You are about to drop the column `full_name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "full_name",
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT;

-- RenameForeignKey
ALTER TABLE "user_daily_activities" RENAME CONSTRAINT "user_daily_activities_streak_id_fkey" TO "user_daily_activities_user_streak_fkey";
