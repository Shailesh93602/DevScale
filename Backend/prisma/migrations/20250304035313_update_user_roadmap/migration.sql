/*
  Warnings:

  - You are about to drop the column `topic_id` on the `UserRoadmap` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserRoadmap" DROP CONSTRAINT "UserRoadmap_topic_id_fkey";

-- DropIndex
DROP INDEX "UserRoadmap_topic_id_idx";

-- AlterTable
ALTER TABLE "UserProgress" ALTER COLUMN "confidence_level" SET DEFAULT NULL,
ALTER COLUMN "progress_percentage" SET DEFAULT NULL;

-- AlterTable
ALTER TABLE "UserRoadmap" DROP COLUMN "topic_id";
