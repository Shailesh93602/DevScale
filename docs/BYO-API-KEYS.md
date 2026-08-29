# Bring-your-own AI keys

Users supply their own Google Gemini API key. Their AI usage is billed to their
own free-tier quota rather than to a single shared server key.

## Why

The AI features (code review, tutor, hints, recommendations, embeddings) all
call Gemini. With one server key, every visitor evaluating the project spends
the owner's quota — and Gemini's free tier is small enough that a handful of
people exhaust it, at which point the feature is broken for everyone including
the owner.

It is also the better security posture by accident: in production there is no
server key at all, so there is no single credential whose compromise affects
every user.

## What is stored, and how

`UserAiKey` — one row per (user, provider):

| Column      | Contents                                               |
| ----------- | ------------------------------------------------------ |
| `key_enc`   | AES-256-GCM ciphertext, `v1.<iv>.<authTag>.<data>`     |
| `key_hint`  | `••••WXYZ` — last four characters, for the settings UI |
| `last_used` | When the key last billed a request                     |

`UNIQUE (user_id, provider)` makes saving an upsert. Without it a user who saves
twice has two rows and the resolver has to pick one — which is how "it's still
using my old key" happens.

It is a separate table rather than columns on `User` deliberately. `User` has
~120 fields, and a `findUnique` on it happens everywhere; a relation cannot
arrive by accident, so the ciphertext is only in the process when someone asked
for it by name.

## What this protects against — and what it does not

`Backend/src/utils/secretBox.ts` is **application-level encryption with a single
master key held in the environment** (`SECRET_ENCRYPTION_KEY`, base64 of 32
random bytes).

**It defends against disclosure of the database without the application's
environment** — a leaked dump, a stolen backup, a misconfigured read replica.
That is a real and common threat.

**It is not envelope encryption. There is no KMS and no HSM.** An attacker
holding both the database and the app's environment holds the keys. Defending
that is a different project, and this document exists partly so nobody later
describes this as more than it is.

The algorithm is GCM rather than CBC because it is **authenticated**: it detects
tampering as well as preventing reading. With CBC, an attacker with write access
to the database could flip bits in a ciphertext undetected.

`decryptSecret` throws on a failed auth tag rather than returning `null`. A
caller handed `null` is tempted to read it as "no key set" and carry on; a throw
cannot be ignored by accident.

### Rotating `SECRET_ENCRYPTION_KEY`

Every stored key becomes undecryptable. There is no re-encrypt path yet — users
have to re-enter their keys. The failure is at least _visible_: `resolveApiKey`
logs each failure and returns `none` rather than falling back to the server key,
so the situation surfaces as "add your key again" rather than as a silently
larger bill for the owner.

## Who pays for a call

`Backend/src/services/ai/resolveApiKey.ts` — **the only module that decrypts a
user key**. Auditing "where can a credential be read" is a search for one
import.

1. The user's own key.
2. `GEMINI_API_KEY`, if the deployment has one.
3. Nothing → `NoApiKeyError` (400, `details.code = AI_KEY_REQUIRED`).

A **decryption failure does not fall through to the server key.** Billing the
owner instead would hide a rotated master key or tampering forever, and would
hand the user a working feature that is not using the key they configured.

The key is resolved **before the cache is read**. Otherwise a user with no key
gets someone else's cache hit and the feature appears to work until the first
miss — the worst moment to discover you needed a key.

## Isolation: the part that is not free

Two pieces of runtime state were global and had to be partitioned. Both would
have made this feature a **reliability regression** — the change meant to
isolate users would have coupled them.

**Model cooldowns** (`llmFallback.ts`) are keyed `<fingerprint>:<model>`, not
`<model>`. Quota is per key. One user hitting their personal ceiling says
nothing about anyone else's; a model-only key let a single visitor park
`gemini-2.0-flash` for every other user and for the server key.

**The circuit breaker** (`llmService.ts`) is one per key, not one global. It
trips on error _rate_ — five failures at 50%. A typo'd credential fails on every
call, so one shared breaker meant one user's typo disabled AI platform-wide
within seconds.

The fingerprint is a truncated SHA-256 of the key (`keyFingerprint`), so the raw
credential is not also sitting in long-lived Map keys.

**The response cache is deliberately shared.** An identical prompt has an
identical answer regardless of which key produced it, and no key material is in
the cached value. Partitioning it would make every user re-buy work already
done.

`Backend/src/tests/ai/keyIsolation.test.ts` asserts all four of these against
observable behaviour rather than internal Maps. Both isolation properties were
verified by mutation: reverting the cooldown scope, and sharing the breaker,
each fail exactly one test and only that test.

## The API

All routes require auth and scope every query by `req.user.id`. **There is
deliberately no admin route to read another user's key** — encryption is worth
little if a privileged endpoint can undo it.

| Route                     | Behaviour                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /settings/ai-key`    | Whether one is configured, the masked hint, timestamps, and whether storage is available at all. **Never the value** — `key_enc` is not even selected. |
| `PUT /settings/ai-key`    | Encrypt and upsert. Validates **length only** (20–400).                                                                                                |
| `DELETE /settings/ai-key` | `deleteMany`, so removing a key that is already gone is a success, not a 404.                                                                          |

**No read path returns the plaintext, not even to its owner.** That loses a
small convenience and removes a class of leak: a GET that returns a credential
ends up in a browser cache, a HAR file on a bug report, a proxy log, a
screenshot.

**Validation is length-only on purpose.** Validating the shape of someone else's
credential is a trap — Google has changed key prefixes before, and a rule that
is right today rejects a valid key tomorrow with a message the user cannot act
on. The zod issue is never forwarded to the client either: its `received` field
can carry the submitted value, and an error path is the classic way a secret
reaches a log.

## Setup

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Set it as `SECRET_ENCRYPTION_KEY` on the Backend. Without it the server still
boots and everything else works — the settings page reports that saving is
unavailable rather than inviting someone to paste a credential into a form that
will reject it.

Users get their own key free at <https://aistudio.google.com/apikey>.
