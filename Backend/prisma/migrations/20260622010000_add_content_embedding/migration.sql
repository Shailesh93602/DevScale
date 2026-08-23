-- Spine B: semantic embeddings via pgvector.
-- Supabase ships the `vector` extension; enabling is idempotent. Hand-authored
-- because the column type (vector) is Unsupported by Prisma's migration engine.

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "ContentEmbedding" (
    "id" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "model" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentEmbedding_content_type_content_id_key" ON "ContentEmbedding"("content_type", "content_id");

-- CreateIndex
CREATE INDEX "ContentEmbedding_content_type_idx" ON "ContentEmbedding"("content_type");

-- Approximate-nearest-neighbour index for cosine distance (<=>). ivfflat needs
-- ANALYZE/data to be effective; fine to create empty.
CREATE INDEX "ContentEmbedding_embedding_cosine_idx"
    ON "ContentEmbedding" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
