/**
 * Authenticated encryption for secrets a USER gives us — currently their own
 * Gemini API key for the AI features.
 *
 * WHY THIS EXISTS AT ALL.
 *
 * Asking someone for their API key is asking them to hand over a credential
 * that can spend their money. That obliges us to store it in a way that a
 * database dump alone does not compromise. A plaintext column would mean any
 * backup, any log of a query, any accidental `SELECT *` in a screenshot leaks
 * every user's key at once.
 *
 * WHAT THIS IS, HONESTLY.
 *
 * Application-level encryption with a single master key held in the
 * environment. It is NOT envelope encryption with a KMS or an HSM, and this
 * comment exists so nobody later describes it as though it were. The threat it
 * actually defends against is disclosure of the database WITHOUT the
 * application's environment — a leaked dump, a stolen backup, a misconfigured
 * read replica. If an attacker has both the database and the app's env, they
 * have the keys; defending that needs a KMS and is a different project.
 *
 * THE ALGORITHM CHOICE.
 *
 * AES-256-GCM, because it is AUTHENTICATED: it detects tampering as well as
 * preventing reading. AES-256-CBC would encrypt just as well and let an
 * attacker with write access to the database flip bits in the ciphertext
 * undetected. The auth tag is what makes `decryptSecret` able to refuse.
 *
 * This is a deliberate port of KhataGO's lib/crypto/secretBox.ts. The format is
 * byte-compatible, which is the point: one reviewed implementation of the hard
 * part, not two subtly different ones.
 */

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32; // AES-256
const IV_BYTES = 12; // 96 bits — the size GCM is specified and optimised for
const AUTH_TAG_BYTES = 16;

/** Marks the format so a future migration can tell versions apart. */
const VERSION = 'v1';

export class SecretEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecretEncryptionError';
  }
}

/**
 * The master key, from the environment.
 *
 * Read on every call rather than cached at module load, so a misconfigured
 * deployment fails at the point of use with a clear message instead of at
 * import time with a stack trace from somewhere unrelated. It is also why the
 * server still boots without it — BYO keys are an optional feature, exactly
 * like GEMINI_API_KEY itself.
 */
function masterKey(): Buffer {
  const raw = process.env.SECRET_ENCRYPTION_KEY;
  if (!raw) {
    throw new SecretEncryptionError(
      'SECRET_ENCRYPTION_KEY is not set. Generate one with:\n' +
        "  node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    );
  }

  const key = Buffer.from(raw, 'base64');
  if (key.length !== KEY_BYTES) {
    // A short key is the classic way this gets weakened silently — someone
    // pastes a 16-character passphrase and AES-256 quietly becomes a
    // 16-character password. Refuse rather than pad.
    throw new SecretEncryptionError(
      `SECRET_ENCRYPTION_KEY must decode to exactly ${KEY_BYTES} bytes, got ${key.length}. ` +
        'It must be base64 of 32 random bytes, not a passphrase.'
    );
  }
  return key;
}

/** True when the master key is present and well-formed — for a health check. */
export function isSecretBoxConfigured(): boolean {
  try {
    masterKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * Encrypt a secret.
 *
 * Returns `v1.<iv>.<authTag>.<ciphertext>`, all base64url. The IV is random per
 * call and stored alongside — that is correct and required. Reusing an IV with
 * GCM is catastrophic (it leaks the XOR of the plaintexts and can forge the
 * auth key), which is why it is generated here and never passed in.
 */
export function encryptSecret(plaintext: string): string {
  if (plaintext.length === 0) {
    throw new SecretEncryptionError('Refusing to encrypt an empty secret.');
  }

  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey(), iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

/**
 * Decrypt a secret, or throw.
 *
 * Throws rather than returning null on tampering, deliberately. A caller that
 * gets `null` is tempted to treat it as "no key set" and carry on; a throw
 * cannot be ignored by accident. Tampered ciphertext is a security event, not
 * a missing value.
 */
export function decryptSecret(stored: string): string {
  const parts = stored.split('.');
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new SecretEncryptionError(
      'Stored secret is not in the expected format.'
    );
  }

  const [, ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, 'base64url');
  const authTag = Buffer.from(tagB64, 'base64url');
  const ciphertext = Buffer.from(dataB64, 'base64url');

  if (iv.length !== IV_BYTES || authTag.length !== AUTH_TAG_BYTES) {
    throw new SecretEncryptionError('Stored secret has malformed components.');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey(), iv);
  decipher.setAuthTag(authTag);

  try {
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    // `final()` throws when the auth tag does not verify. The original error
    // text is not surfaced: it says nothing useful to a caller and repeating
    // crypto internals into logs is how details leak.
    throw new SecretEncryptionError(
      'Secret failed authentication — it was tampered with, or encrypted with a different key.'
    );
  }
}

/**
 * The last four characters, for showing which key is configured.
 *
 * The whole point of a masked hint is that it identifies a key to the person
 * who owns it without being useful to anyone else. Four characters of a ~40
 * character key is the same convention Stripe and GitHub use.
 */
export function maskSecret(plaintext: string): string {
  if (plaintext.length <= 4) return '••••';
  return `••••${plaintext.slice(-4)}`;
}

/**
 * A short, stable, NON-REVERSIBLE identifier for a key.
 *
 * Used to partition per-key runtime state (model cooldowns, the circuit
 * breaker) so one user's exhausted quota cannot degrade anyone else's. It must
 * never be logged next to anything that narrows the search space, but on its
 * own a truncated SHA-256 of a high-entropy credential discloses nothing
 * useful.
 */
export function keyFingerprint(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex').slice(0, 16);
}
