# AI recommendations (Spine B — embeddings + pgvector)

"What to try next" for a signed-in learner, built on semantic similarity between
coding challenges. This is the reference for how the vectors get there, when
they are recomputed, and what happens when the embedding model changes.

## The pieces

| Piece                                        | Role                                                                                                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `services/ai/embeddingProvider.ts`           | The only file that touches the Gemini embeddings SDK. `EMBEDDING_MODEL` (env `GEMINI_EMBEDDING_MODEL`, default `text-embedding-004`), `EMBEDDING_DIMENSIONS` (768). |
| `services/ai/embeddingService.ts`            | `embedText(text, userId)` — resolves whose key pays ([BYO keys](BYO-API-KEYS.md)), then a 7-day Redis cache keyed by content hash, then the provider.               |
| `services/ai/contentIngestService.ts`        | `ingest({ contentType, contentId, text }, userId?, { force? })` — the idempotent write. Decides whether to call the provider at all.                                |
| `services/ai/challengeIngestService.ts`      | Builds the embeddable text for a challenge (title, description, difficulty, category, tags) and drives `reindexAll`.                                                |
| `repositories/contentEmbeddingRepository.ts` | Raw SQL over `"ContentEmbedding"` (`vector(768)` is `Unsupported` in Prisma). Upsert, fingerprint read, cosine `<=>` nearest-neighbour queries.                     |
| `services/ai/recommendationService.ts`       | Ranks unattempted challenges by distance to what the learner has solved.                                                                                            |
| `controllers/recommendationController.ts`    | `GET /recommendations/challenges`, `POST /recommendations/admin/reindex-challenges`.                                                                                |

One row per `(content_type, content_id)`; the table also stores `content_hash`,
`model` and `dimensions` — see the next section for why all three.

## When a row is re-embedded — the fingerprint

An embedding call is the expensive step, so `ingest` skips it when the stored
row is still current. **"Current" is a three-part fingerprint, not a hash:**

```
stored.content_hash === sha256(text)
  && stored.model      === EMBEDDING_MODEL
  && stored.dimensions === EMBEDDING_DIMENSIONS
```

The first version compared the content hash only. That is the right test for
_the text_ and the wrong test for _the vector_: an embedding is a function of
the text **and** the model that produced it. After a change of
`GEMINI_EMBEDDING_MODEL`, every unchanged challenge still matched its hash,
`reindexAll` reported it `skipped`, and the row kept the old model's vector
while new challenges got the new model's. One table, two embedding spaces;
cosine distance between them is a number with no meaning, and the reindex
endpoint said success the whole time.

With the model and dimension in the fingerprint, changing the model makes
every row stale, and the **next ordinary reindex re-embeds all of them**. No
flag needed; that is the rollout procedure:

1. Set `GEMINI_EMBEDDING_MODEL` (and, if the new model's width differs,
   `EMBEDDING_DIMENSIONS` **and** a migration altering the column's
   `vector(N)` — the column is fixed-width; the fingerprint catches the
   mismatch but cannot resize the column).
2. Deploy.
3. `POST /api/v1/recommendations/admin/reindex-challenges` (ADMIN). Expect
   `updated ≈ total`, `skipped ≈ 0` on the first run and `skipped ≈ total`
   on the second.

`dimensions` was added by migration `20260905120000_content_embedding_dimensions`
— additive, `INTEGER NOT NULL DEFAULT 768`, which is truthful for every existing
row because the column type was already `vector(768)`.

### `force`

`POST /api/v1/recommendations/admin/reindex-challenges?force=true` (or a JSON
body `{ "force": true }`) bypasses the fingerprint and re-embeds every active
challenge. Only the literal `true` forces. It exists for what the fingerprint
cannot see — a provider that changes its output or normalisation under the
same model name — and for repairing a table you no longer trust. It costs one
embedding call per active challenge, billed to the server key.

## `reindexAll` is bounded and resumable

Pages of 100 by id, 5 embeddings in flight, a failing row counted (`failed`)
rather than thrown. Because the skip is cheap for anything already current,
a run that times out is simply run again and picks up where it stopped. The
response is `{ total, created, updated, skipped, failed }`.

## Tests

- `src/tests/ai/contentIngestService.test.ts` — skip on matching fingerprint;
  re-embed on same hash + different model; same hash + different dimension;
  `force` re-embeds a current row; `force: false` still skips.
- `src/tests/ai/contentEmbeddingRepository.test.ts` — the fingerprint read
  selects all three columns; upsert writes `model` and `dimensions` on insert
  and on conflict.
- `src/tests/services/reindexBounds.test.ts` — paging, concurrency, the
  failure count, and that `force` reaches every ingest.
- `src/tests/controllers/recommendationController.test.ts` — `?force=true`
  and body `{ force: true }` force; `"1"`, `"yes"`, `"TRUE"` do not.

The migration is verified against a local Postgres 17 with pgvector (the
brew `postgresql@16` service cannot `CREATE EXTENSION vector`); the recipe is
in [QA_COVERAGE.md](QA_COVERAGE.md).
