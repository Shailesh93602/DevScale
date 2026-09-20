import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { buildContactMailto } from './contact-mailto';

const parse = (url: string) => {
  expect(url.startsWith('mailto:')).toBe(true);
  const [head, query] = url.slice('mailto:'.length).split('?');
  const params = new URLSearchParams(query);
  return {
    to: decodeURIComponent(head),
    subject: params.get('subject') ?? '',
    body: params.get('body') ?? '',
  };
};

describe('buildContactMailto', () => {
  const base = {
    to: 'hello@example.com',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Hello there.',
  };

  it('addresses the mail to the configured contact address', () => {
    expect(parse(buildContactMailto(base)).to).toBe('hello@example.com');
  });

  it('carries the sender name, sender address and message into the body', () => {
    const { subject, body } = parse(buildContactMailto(base));
    expect(subject).toContain('Ada Lovelace');
    expect(body).toContain('Ada Lovelace');
    expect(body).toContain('ada@example.com');
    expect(body).toContain('Hello there.');
  });

  it('does not truncate a message containing & ? # — the classic mailto bug', () => {
    // encodeURI would leave these intact and the body would end at the '&',
    // silently dropping everything after it. That is the same "your message
    // vanished" outcome this whole change exists to stop, so it is asserted
    // rather than assumed.
    const message = 'Pricing for A & B? See #3 — 100% of it, plus a=b.';
    const { body } = parse(buildContactMailto({ ...base, message }));
    expect(body).toContain(message);
  });

  it('survives a name containing an ampersand without losing the subject', () => {
    const { subject, body } = parse(
      buildContactMailto({ ...base, name: 'Ben & Jerry' }),
    );
    expect(subject).toContain('Ben & Jerry');
    expect(body).toContain('Ben & Jerry');
  });

  it('trims surrounding whitespace rather than mailing it', () => {
    const { body } = parse(
      buildContactMailto({ ...base, name: '  Ada  ', message: '  hi  ' }),
    );
    expect(body).toContain('Name: Ada\n');
    expect(body.endsWith('hi')).toBe(true);
  });

  it('still produces a usable mailto when the name is empty', () => {
    const { subject, to } = parse(buildContactMailto({ ...base, name: '' }));
    expect(to).toBe('hello@example.com');
    expect(subject).toBe('EduScale contact form');
  });
});

/**
 * The bug was not "the mailto was wrong" — it was that a form claimed success
 * without sending anything. A test of the replacement cannot catch that coming
 * back somewhere else, so this scans the app for the shape of it.
 *
 * `/doubts` already had a fake-submit removed once and `/contact` was still
 * doing it months later, which is the argument for a check rather than a note.
 */
describe('no form claims success without doing anything', () => {
  const appDir = join(__dirname, '..', 'app');

  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) return walk(full);
      return /\.tsx$/.test(full) && !/\.test\.tsx$/.test(full) ? [full] : [];
    });

  const files = walk(appDir);

  it('finds page sources to scan', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('no page fakes a request with a bare setTimeout promise', () => {
    // The exact original: `await new Promise(resolve => setTimeout(resolve, 1000))`
    // standing in for a network call, immediately before a success toast.
    const fakeRequest =
      /new Promise\s*\(\s*\(?\s*resolve\s*\)?\s*=>\s*setTimeout\s*\(\s*resolve/;
    const offenders = files.filter((f) =>
      fakeRequest.test(readFileSync(f, 'utf8')),
    );
    expect(
      offenders.map((f) => f.replace(appDir, 'src/app')),
      'these simulate a request instead of making one',
    ).toEqual([]);
  });

  it('no page ships a "Simulate API call" marker', () => {
    const offenders = files.filter((f) =>
      /simulat\w*\s+(?:the\s+)?api\s+call/i.test(readFileSync(f, 'utf8')),
    );
    expect(offenders.map((f) => f.replace(appDir, 'src/app'))).toEqual([]);
  });
});
