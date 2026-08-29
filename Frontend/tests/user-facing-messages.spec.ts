import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { test, expect } from '@playwright/test';

/**
 * Messages shown to users must describe what THEY were doing, not what the code
 * was doing.
 *
 * WHY THIS EXISTS.
 *
 * A like button failed with "Failed to update like status". That is the name of
 * an internal operation. The person reading it tried to like a roadmap — they
 * have no idea what a "like status" is, whether it is their fault, or what to do
 * next.
 *
 * There were 49 distinct messages like it across 60 call sites: "Failed to fetch
 * roadmap", "Error fetching resources", "Error updating user details". All of
 * them leaked implementation vocabulary into a toast.
 *
 * The rule this enforces, from standard UX-writing guidance: say what failed in
 * the user's terms, then what they can do. "Couldn't save your like. Please try
 * again."
 *
 * IT ONLY CHECKS `toast.*` — console.error and thrown Error messages SHOULD stay
 * technical. Those are read by whoever is debugging, and vagueness there is its
 * own bug. The distinction is the audience, not the tone.
 */

const SRC = join(process.cwd(), 'src');

/**
 * Vocabulary that belongs in a log, not in front of a person.
 *
 * Each entry is a phrase a developer reaches for naturally while writing the
 * code, which is exactly why they end up in toasts — the message gets written
 * in the same breath as the fetch it describes.
 */
const DEVELOPER_LANGUAGE: Array<{ pattern: RegExp; why: string }> = [
  { pattern: /\bfailed to fetch\b/i, why: '"fetch" is what the code did, not what the user did' },
  { pattern: /\berror fetching\b/i, why: '"fetching" is implementation vocabulary' },
  { pattern: /\bfailed to (update|get|set) .*\bstatus\b/i, why: '"status" names an internal field' },
  { pattern: /\bAPI\b/, why: 'users do not know or care that there is an API' },
  { pattern: /\bendpoint\b/i, why: 'implementation detail' },
  { pattern: /\b(null|undefined|NaN)\b/, why: 'a value from the code has leaked into the message' },
  { pattern: /\b[45]\d{2}\b/, why: 'an HTTP status code means nothing to a user' },
  { pattern: /\bexception\b/i, why: 'implementation vocabulary' },
  { pattern: /\bpayload\b/i, why: 'implementation vocabulary' },
];

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.(tsx?|jsx?)$/.test(entry)) out.push(full);
  }
  return out;
}

const TOAST = /toast\.(error|warn|warning)\(\s*['"`]([^'"`]{3,200})['"`]/g;

test.describe('user-facing messages', () => {
  test('no toast speaks in developer vocabulary', () => {
    const offences: string[] = [];

    for (const file of sourceFiles(SRC)) {
      const src = readFileSync(file, 'utf8');
      const rel = file.replace(process.cwd() + '/', '');

      TOAST.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = TOAST.exec(src)) !== null) {
        const message = m[2];
        for (const { pattern, why } of DEVELOPER_LANGUAGE) {
          if (pattern.test(message)) {
            offences.push(`"${message}" — ${why}  (${rel})`);
            break;
          }
        }
      }
    }

    expect(
      offences,
      'These messages are shown to users but describe what the code was doing. ' +
        'Say what the person was trying to do, then what they can do next.'
    ).toEqual([]);
  });

  test('every error toast tells the user what to do next', () => {
    // A message that only says something broke leaves the reader stuck. Almost
    // every failure here is retryable or fixed by a refresh, so saying so costs
    // one sentence and removes the dead end.
    //
    // Deliberately not exhaustive: a few messages are self-evidently terminal
    // ("Wrong Answer") and adding "please try again" to those would be worse.
    const RECOVERY = /(try again|refresh|check your|sign in|log in|contact|choose|select|fill in)/i;
    const EXEMPT = /^(wrong answer|something went wrong\.)/i;

    const stuck: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const src = readFileSync(file, 'utf8');
      const rel = file.replace(process.cwd() + '/', '');
      TOAST.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = TOAST.exec(src)) !== null) {
        const message = m[2];
        if (message.includes('${')) continue; // interpolated — judged at runtime
        if (EXEMPT.test(message.trim())) continue;
        if (!RECOVERY.test(message)) stuck.push(`"${message}"  (${rel})`);
      }
    }

    expect(
      stuck,
      'These tell the user something failed but not what to do about it.'
    ).toEqual([]);
  });
});
