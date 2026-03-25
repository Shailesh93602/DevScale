/*
  Warnings:

  - You are about to drop the column `feature_id` on the `permissions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_feature_id_fkey";

-- AlterTable
ALTER TABLE "UserProgress" ALTER COLUMN "confidence_level" SET DEFAULT NULL,
ALTER COLUMN "progress_percentage" SET DEFAULT NULL;

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "feature_id";

-- CreateTable
CREATE TABLE "_FeatureToPermission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FeatureToPermission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FeatureToPermission_B_index" ON "_FeatureToPermission"("B");

-- AddForeignKey
ALTER TABLE "_FeatureToPermission" ADD CONSTRAINT "_FeatureToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToPermission" ADD CONSTRAINT "_FeatureToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
