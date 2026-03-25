-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "tags" TEXT;

-- AlterTable
ALTER TABLE "UserProgress" ALTER COLUMN "confidence_level" SET DEFAULT NULL,
ALTER COLUMN "progress_percentage" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "RoadmapCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapCategory_name_key" ON "RoadmapCategory"("name");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "RoadmapCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
