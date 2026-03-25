/*
  Warnings:

  - You are about to drop the column `status` on the `ContentModeration` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ContentModeration` table. All the data in the column will be lost.
  - You are about to drop the column `concept_id` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `concept_id` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `Concept` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PermissionGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionToPermissionGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionToRole` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `action` to the `ContentModeration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_type` to the `ContentModeration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moderator_id` to the `ContentModeration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `MainConcept` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Concept" DROP CONSTRAINT "Concept_roadmap_id_fkey";

-- DropForeignKey
ALTER TABLE "ContentModeration" DROP CONSTRAINT "ContentModeration_content_id_fkey";

-- DropForeignKey
ALTER TABLE "ContentModeration" DROP CONSTRAINT "ContentModeration_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_concept_id_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_concept_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_role_id_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToPermissionGroup" DROP CONSTRAINT "_PermissionToPermissionGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToPermissionGroup" DROP CONSTRAINT "_PermissionToPermissionGroup_B_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_B_fkey";

-- DropIndex
DROP INDEX "Quiz_concept_id_idx";

-- DropIndex
DROP INDEX "Subject_concept_id_idx";

-- AlterTable
ALTER TABLE "ContentModeration" DROP COLUMN "status",
DROP COLUMN "user_id",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "content_type" TEXT NOT NULL,
ADD COLUMN     "moderator_id" TEXT NOT NULL,
ALTER COLUMN "notes" DROP NOT NULL,
ALTER COLUMN "content_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MainConcept" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "concept_id",
ADD COLUMN     "main_concept_id" TEXT;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "concept_id",
ADD COLUMN     "main_concept_id" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "experience_level" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserProgress" ALTER COLUMN "confidence_level" SET DEFAULT NULL,
ALTER COLUMN "progress_percentage" SET DEFAULT NULL;

-- DropTable
DROP TABLE "Concept";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "PermissionGroup";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "_PermissionToPermissionGroup";

-- DropTable
DROP TABLE "_PermissionToRole";

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "key" TEXT NOT NULL,
    "feature_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "features_name_key" ON "features"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_key" ON "user_permissions"("user_id", "permission_id");

-- CreateIndex
CREATE INDEX "ContentModeration_content_id_idx" ON "ContentModeration"("content_id");

-- CreateIndex
CREATE INDEX "ContentModeration_article_id_idx" ON "ContentModeration"("article_id");

-- CreateIndex
CREATE INDEX "ContentModeration_resource_id_idx" ON "ContentModeration"("resource_id");

-- CreateIndex
CREATE INDEX "ContentModeration_moderator_id_idx" ON "ContentModeration"("moderator_id");

-- CreateIndex
CREATE INDEX "Quiz_main_concept_id_idx" ON "Quiz"("main_concept_id");

-- CreateIndex
CREATE INDEX "Subject_main_concept_id_idx" ON "Subject"("main_concept_id");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_main_concept_id_fkey" FOREIGN KEY ("main_concept_id") REFERENCES "MainConcept"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModeration" ADD CONSTRAINT "ContentModeration_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModeration" ADD CONSTRAINT "ContentModeration_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;
