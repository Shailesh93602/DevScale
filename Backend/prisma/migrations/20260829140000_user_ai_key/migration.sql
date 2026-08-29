-- A user's own third-party AI provider credential, encrypted at rest.
--
-- key_enc holds AES-256-GCM ciphertext (v1.<iv>.<tag>.<data>), never plaintext.
-- The UNIQUE (user_id, provider) is what makes "save my key" an upsert rather
-- than an append: without it a user who saves twice ends up with two rows and
-- the resolver has to pick one, which is exactly the kind of ambiguity that
-- turns into "it used my old key" bug reports.
CREATE TABLE "UserAiKey" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "key_enc" TEXT NOT NULL,
    "key_hint" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_used" TIMESTAMP(3),

    CONSTRAINT "UserAiKey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserAiKey_user_id_provider_key" ON "UserAiKey"("user_id", "provider");
CREATE INDEX "UserAiKey_user_id_idx" ON "UserAiKey"("user_id");

ALTER TABLE "UserAiKey" ADD CONSTRAINT "UserAiKey_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
