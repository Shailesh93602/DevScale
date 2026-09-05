-- Spine B: record the embedding SPACE each row was produced in, not just the
-- text. The ingest skip compared content hashes only, so a change of embedding
-- model re-embedded nothing and left one table holding vectors from two
-- incomparable spaces. The model was already stored; the dimension was not.
--
-- Additive. Every existing row is vector(768) by column type, so 768 is the
-- truthful default, and the ingest service now compares (hash, model,
-- dimensions) before skipping.
ALTER TABLE "ContentEmbedding" ADD COLUMN "dimensions" INTEGER NOT NULL DEFAULT 768;
