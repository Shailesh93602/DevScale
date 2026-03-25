/*
  Warnings:

  - You are about to drop the column `roadmap_id` on the `MainConcept` table. All the data in the column will be lost.
  - You are about to drop the column `main_concept_id` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `subject_id` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the `_MainConceptToSubject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoadmapToTopic` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `MainConcept` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `Roadmap` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MainConcept" DROP CONSTRAINT "MainConcept_roadmap_id_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "_MainConceptToSubject" DROP CONSTRAINT "_MainConceptToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "_MainConceptToSubject" DROP CONSTRAINT "_MainConceptToSubject_B_fkey";

-- DropForeignKey
ALTER TABLE "_RoadmapToTopic" DROP CONSTRAINT "_RoadmapToTopic_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoadmapToTopic" DROP CONSTRAINT "_RoadmapToTopic_B_fkey";

-- DropIndex
DROP INDEX "Subject_main_concept_id_idx";

-- DropIndex
DROP INDEX "Topic_subject_id_idx";

-- AlterTable
ALTER TABLE "ForumComment" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ForumPost" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "MainConcept" DROP COLUMN "roadmap_id";

-- AlterTable
ALTER TABLE "StudyGroup" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "StudyGroupMember" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "main_concept_id",
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TeamProject" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TeamProjectMember" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "subject_id",
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserProgress" ALTER COLUMN "confidence_level" SET DEFAULT NULL,
ALTER COLUMN "progress_percentage" SET DEFAULT NULL;

-- DropTable
DROP TABLE "_MainConceptToSubject";

-- DropTable
DROP TABLE "_RoadmapToTopic";

-- CreateTable
CREATE TABLE "RoadmapMainConcept" (
    "id" TEXT NOT NULL,
    "roadmap_id" TEXT NOT NULL,
    "main_concept_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapMainConcept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainConceptSubject" (
    "id" TEXT NOT NULL,
    "main_concept_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MainConceptSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectTopic" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapTopic" (
    "id" TEXT NOT NULL,
    "roadmap_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoadmapMainConcept_roadmap_id_idx" ON "RoadmapMainConcept"("roadmap_id");

-- CreateIndex
CREATE INDEX "RoadmapMainConcept_main_concept_id_idx" ON "RoadmapMainConcept"("main_concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapMainConcept_roadmap_id_main_concept_id_key" ON "RoadmapMainConcept"("roadmap_id", "main_concept_id");

-- CreateIndex
CREATE INDEX "MainConceptSubject_main_concept_id_idx" ON "MainConceptSubject"("main_concept_id");

-- CreateIndex
CREATE INDEX "MainConceptSubject_subject_id_idx" ON "MainConceptSubject"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "MainConceptSubject_main_concept_id_subject_id_key" ON "MainConceptSubject"("main_concept_id", "subject_id");

-- CreateIndex
CREATE INDEX "SubjectTopic_subject_id_idx" ON "SubjectTopic"("subject_id");

-- CreateIndex
CREATE INDEX "SubjectTopic_topic_id_idx" ON "SubjectTopic"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectTopic_subject_id_topic_id_key" ON "SubjectTopic"("subject_id", "topic_id");

-- CreateIndex
CREATE INDEX "RoadmapTopic_roadmap_id_idx" ON "RoadmapTopic"("roadmap_id");

-- CreateIndex
CREATE INDEX "RoadmapTopic_topic_id_idx" ON "RoadmapTopic"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapTopic_roadmap_id_topic_id_key" ON "RoadmapTopic"("roadmap_id", "topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "MainConcept_name_key" ON "MainConcept"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_title_key" ON "Roadmap"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_title_key" ON "Subject"("title");

-- CreateIndex
CREATE INDEX "Subject_id_idx" ON "Subject"("id");

-- CreateIndex
CREATE INDEX "Topic_id_idx" ON "Topic"("id");

-- AddForeignKey
ALTER TABLE "RoadmapMainConcept" ADD CONSTRAINT "RoadmapMainConcept_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "Roadmap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapMainConcept" ADD CONSTRAINT "RoadmapMainConcept_main_concept_id_fkey" FOREIGN KEY ("main_concept_id") REFERENCES "MainConcept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainConceptSubject" ADD CONSTRAINT "MainConceptSubject_main_concept_id_fkey" FOREIGN KEY ("main_concept_id") REFERENCES "MainConcept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainConceptSubject" ADD CONSTRAINT "MainConceptSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTopic" ADD CONSTRAINT "SubjectTopic_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTopic" ADD CONSTRAINT "SubjectTopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapTopic" ADD CONSTRAINT "RoadmapTopic_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "Roadmap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapTopic" ADD CONSTRAINT "RoadmapTopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
