import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The public DevScale mirror is what a recruiter opens. Its root CLAUDE.md
 * opened with a ten-million-user target for a platform that has never
 * measured anything like it — an aspiration that reads as a claim. This test
 * keeps unbacked scale figures out of every prose file the mirror serves.
 *
 * If a number like this ever becomes true, the honest move is to add the
 * measurement that proves it and relax the pattern here — not to delete the
 * test.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WIDENED 2026-09-20, because the guard had the wrong scope.
 *
 * It scanned prose only — CLAUDE.md, README, FINDINGS, llms.txt, docs/ — so
 * the pages a VISITOR actually reads were outside it. That is where the worst
 * claim in the repo was sitting the whole time: `/pricing` sold "Pro Learner"
 * at $29/mo on six features and "EduScale Team" at $99/user/mo on six more,
 * and of those twelve, ONE existed (AI code review, ungated and free to every
 * signed-in user). `requirePro` and `requireTeam` are fully implemented and
 * applied to zero routes: nothing in this product has ever been gated on a
 * subscription tier. The landing page's showcase made the same kind of claim —
 * mock interviews, job placement, workshops, prizes, certificates — none of
 * which exists either.
 *
 * So there are now two scopes, deliberately different:
 *
 *   PROSE_FILES — unbacked SCALE figures only. Docs must stay free to discuss
 *                 what is not built; that is what docs are for. The decision
 *                 note at docs/PRICING-GROUND-TRUTH.md names every cut feature
 *                 on purpose.
 *
 *   UI_FILES    — rendered marketing surfaces. Scale figures AND named
 *                 features that nothing implements. A rendered page may name
 *                 an unbuilt feature only while denying it: a line carrying
 *                 "not built" / "not available" / "coming soon" is exempt.
 *                 Delete the denial and the test fails, which is the point.
 *
 * Plus one structural invariant that is not a copy of any string on the page:
 * YOU MAY NOT SELL A TIER THAT GATES NOTHING. If /pricing charges money, the
 * tier middleware has to be wired to at least one route.
 */

const repoRoot = join(__dirname, '..', '..', '..');

const PROSE_FILES = [
  'CLAUDE.md',
  'README.md',
  'FINDINGS.md',
  'Frontend/public/llms.txt',
  ...readdirSync(join(repoRoot, 'docs'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => `docs/${f}`),
];

/**
 * Every file that renders marketing copy a signed-out visitor sees: the
 * pricing table, the landing page and its sections, the FAQ answers, the
 * about page. Directories are expanded so a NEW landing section is covered
 * the day it is added, rather than the day someone remembers to list it.
 */
const UI_DIRS = [
  'Frontend/src/app/pricing',
  'Frontend/src/app/about',
  'Frontend/src/app/faq',
  'Frontend/src/components/Landing',
];
const UI_EXTRA_FILES = [
  'Frontend/src/app/page.tsx',
  'Frontend/src/components/ui/stats-showcase.tsx',
];

const UI_FILES = [
  ...UI_DIRS.flatMap((dir) =>
    readdirSync(join(repoRoot, dir))
      .filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f))
      .map((f) => `${dir}/${f}`),
  ),
  ...UI_EXTRA_FILES,
];

const UNBACKED_SCALE_CLAIMS: Array<{ label: string; pattern: RegExp }> = [
  { label: '10M', pattern: /\b10\s?M\+?\b/ },
  { label: '10 million', pattern: /\b10\+?\s?million/i },
  { label: 'millions of users', pattern: /millions? of users/i },
  { label: 'thousands of users', pattern: /thousands of users/i },
  { label: 'enterprise-grade', pattern: /enterprise[- ]grade/i },
];

/**
 * Features named in the UI that nothing in this repository implements. Each
 * one carries the evidence that it is absent, so relaxing an entry means
 * disproving its reason — not deleting a line.
 *
 * When one of these is genuinely built, delete its entry here IN THE SAME
 * COMMIT as the code. That is the whole contract.
 */
const UNSHIPPED_FEATURE_CLAIMS: Array<{
  label: string;
  pattern: RegExp;
  why: string;
}> = [
  {
    label: 'courses',
    pattern: /\bcourses?\b|course library/i,
    why: 'no course seeder exists (Backend/prisma/seed.ts seeds roles, users, subjects, topics, challenges, battles and roadmaps — no courses), CourseCard is imported nowhere, and there is no /courses route',
  },
  {
    label: 'mentorship',
    pattern: /\bmentors?(hip)?\b|1[-\s]on[-\s]1/i,
    why: 'Mentorship/MentorshipSession are Prisma models with a repository and no controller, route or UI; /mastermind-forge renders ComingSoon',
  },
  {
    label: 'certificates',
    pattern: /certificat(e|es|ion|ions)\b/i,
    why: 'the Certificate model has zero references anywhere in Backend/src or Frontend/src',
  },
  {
    label: 'account manager',
    pattern: /account manager/i,
    why: 'there is no staffing behind this product',
  },
  {
    label: 'SLA',
    pattern: /\bSLAs?\b/,
    why: 'no service-level commitment is defined or measured anywhere',
  },
  {
    label: 'API access',
    pattern: /API access|public API/i,
    why: 'the ApiKey model has zero code references; no key issuance, no external API surface',
  },
  {
    label: 'enterprise integrations',
    pattern: /enterprise[- ](integration|ready|plan)/i,
    why: 'the only webhook in the repo is Stripe’s inbound one',
  },
  {
    label: 'organization/team accounts',
    pattern:
      /organi[sz]ation dashboard|team management|organi[sz]ation account/i,
    why: 'there is no Organization or tenant model; TeamProject/TeamProjectMember have zero code references',
  },
  {
    label: 'priority support',
    pattern: /priority support/i,
    why: 'ticket priority is a field the reporter sets; nothing routes or escalates by tier',
  },
  {
    label: 'job placement',
    pattern: /job placement|placement assistance/i,
    why: 'no job placement feature, partner or route exists',
  },
  {
    label: 'resume building',
    pattern: /resume (building|review|builder)/i,
    why: 'no resume feature exists; /mastermind-forge, which was to hold it, renders ComingSoon',
  },
  {
    label: 'mock interviews',
    pattern: /mock interviews?/i,
    why: 'the interview surface is a static question bank, not an interview with feedback',
  },
  {
    label: 'live sessions / workshops',
    pattern: /live coding session|workshops?\b|webinars?\b/i,
    why: '/events renders ComingSoon; nothing schedules or hosts a session',
  },
  {
    label: 'prizes',
    pattern: /\bprizes?\b/i,
    why: 'battles award points on a leaderboard; nothing awards a prize',
  },
  {
    label: 'peer code review',
    pattern: /peer (code )?review/i,
    why: 'the only review path is the AI review of your OWN submission (codeReviewRoutes.ts)',
  },
  {
    label: 'portfolio builder',
    pattern: /portfolio builder/i,
    why: 'no portfolio feature exists; the only matches in the repo are prose',
  },
  {
    label: 'response-time promise',
    pattern: /within minutes|instant(ly)? (answer|resolution|support)/i,
    why: 'nothing measures or commits to a response time',
  },
  {
    label: 'unbacked inventory count',
    pattern:
      /\(\s*\d{2,}\+?\s*\)|\b\d{2,}\+\s*(courses?|lessons?|topics?|challenges?|roadmaps?|users?|students?|learners?|developers?|companies)\b/i,
    why: 'no content count on a marketing page is derived from what the database actually holds',
  },
];

/**
 * A rendered page is allowed to NAME an unbuilt feature, but only while
 * saying it is unbuilt, on the same line. This is what makes the
 * "not available yet" pricing card legal and a silent re-introduction not.
 */
const DENIAL = /not built|not available|coming soon|no[t]? yet\b/i;

/**
 * Whole-line comments are skipped: the guard is about copy a visitor READS,
 * and the pricing page has to be able to explain in a comment what it removed
 * and why. Only fully-commented lines are exempt — a rendered string with a
 * trailing comment on the same line is still scanned, so nothing can be
 * hidden behind a `//`.
 */
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*)/;

const read = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');

describe('no unbacked scale claims in the public prose', () => {
  it('scans the files a visitor actually reads', () => {
    expect(PROSE_FILES.length).toBeGreaterThan(4);
  });

  for (const rel of PROSE_FILES) {
    it(`${rel} names no user-count it cannot back`, () => {
      const text = read(rel);
      const hits = UNBACKED_SCALE_CLAIMS.filter((c) =>
        c.pattern.test(text),
      ).map((c) => c.label);
      expect(hits, `${rel} contains: ${hits.join(', ')}`).toEqual([]);
    });
  }
});

describe('no unshipped features advertised in the rendered UI', () => {
  it('has UI surfaces to scan', () => {
    // Every assertion below passes vacuously against an empty list.
    expect(UI_FILES.length).toBeGreaterThan(6);
    expect(UI_FILES).toContain('Frontend/src/app/pricing/page.tsx');
  });

  for (const rel of UI_FILES) {
    it(`${rel} advertises only what ships`, () => {
      const lines = read(rel).split('\n');
      const hits: string[] = [];

      lines.forEach((line, i) => {
        if (COMMENT_LINE.test(line)) return; // not rendered
        if (DENIAL.test(line)) return; // named, but explicitly denied
        for (const claim of [
          ...UNSHIPPED_FEATURE_CLAIMS,
          ...UNBACKED_SCALE_CLAIMS.map((c) => ({
            ...c,
            why: 'unbacked scale claim',
          })),
        ]) {
          if (claim.pattern.test(line)) {
            hits.push(
              `L${i + 1} "${claim.label}" — ${claim.why}\n     ${line.trim()}`,
            );
          }
        }
      });

      expect(hits, `${rel}:\n  ${hits.join('\n  ')}`).toEqual([]);
    });
  }
});

/**
 * The invariant that would have caught this on the day it shipped, and that
 * no amount of rewording can satisfy: a paid tier has to gate something.
 *
 * This reads the BACKEND for call sites rather than re-stating any string on
 * the pricing page, so it cannot go stale the way a guard that repeats the
 * value it guards does.
 */
describe('a paid tier must gate something', () => {
  const GATING_MIDDLEWARE = /\brequire(Pro|Team)\b/;

  const sourceFiles = (dir: string): string[] => {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        return entry.name === 'tests' ? [] : sourceFiles(full);
      }
      return /\.ts$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)
        ? [full]
        : [];
    });
  };

  it('does not charge for a tier no route enforces', () => {
    const pricing = read('Frontend/src/app/pricing/page.tsx');
    const chargesMoney = /price:\s*'\$(?!0')/.test(pricing);

    const wiredIn = sourceFiles(join(repoRoot, 'Backend', 'src'))
      .filter((f) => !f.endsWith(join('middlewares', 'subscriptionGating.ts')))
      .filter((f) => GATING_MIDDLEWARE.test(readFileSync(f, 'utf8')));

    expect(
      chargesMoney && wiredIn.length === 0,
      chargesMoney
        ? 'The pricing page charges for a tier, but requirePro/requireTeam are applied to zero routes — every paid feature is either free or absent.'
        : '',
    ).toBe(false);
  });

  it('keeps the FAQ and the pricing page telling the same story', () => {
    const pricing = read('Frontend/src/app/pricing/page.tsx');
    const faqs = read('Frontend/src/app/faq/faqs.ts');
    const chargesMoney = /price:\s*'\$(?!0')/.test(pricing);

    if (chargesMoney) return; // faqs.test.ts owns this direction

    // Pricing sells nothing, so the FAQ must not offer paid plans as a
    // thing a reader can buy today.
    const offersPaidPlans =
      /\bpaid plans?\b(?![^.]*\bnot\b)/i.test(faqs) &&
      !/no paid plans/i.test(faqs);
    expect(
      offersPaidPlans,
      'the FAQ offers paid plans while /pricing sells none',
    ).toBe(false);
  });
});
