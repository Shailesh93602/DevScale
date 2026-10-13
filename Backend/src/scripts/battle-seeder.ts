/**
 * battle-seeder.ts — the battle seed as a library, so the guard in front of it
 * can be unit-tested against a mocked client.
 *
 * `npm run seed:battles` runs ./seed-battles.ts, which builds a PrismaClient
 * and calls runBattleSeeder(). Nothing in this module reads process.env or
 * constructs a client: the entrypoint decides both, the test passes mocks.
 *
 * WHAT THE SEED DOES. Deletes ALL battle data, then seeds 5 fully-playable
 * battles, one per question source type:
 *   1. topic        — QUICK     EASY    (topic-level scope)
 *   2. subject      — QUICK     MEDIUM  (subject-level scope)
 *   3. main_concept — SCHEDULED MEDIUM  (main-concept-level scope)
 *   4. roadmap      — PRACTICE  HARD    (roadmap-level scope)
 *   5. (manual)     — PRACTICE  EASY    (no pool source — hardcoded questions)
 *
 * WHY THE GUARD IS THE SAME ONE THE BACKEND TESTS USE.
 *
 * Frontend/tests/global-setup.ts runs this seed before every default
 * Playwright run, and Backend/.env points DATABASE_URL at the shared Supabase
 * database. The first guard here (assertSafeToSeed, 2026-08) matched the host
 * against localhost with a regex and let ALLOW_REMOTE_SEED=true skip it. That
 * left three gaps: a local database holding a real copy of the schema
 * (`eduscale`, or the default `postgres`) passed; nothing asked the open
 * connection where it had actually gone; and one env var switched the whole
 * check off. src/tests/helpers/assertTestDatabase.ts already closes all three
 * for battle.test.ts — the URL must name a local host AND a *_test / *_e2e
 * database, then the live connection must report that name. This seed deletes
 * more than those tests do, so it now goes through the same two checks, with
 * no override.
 */

import type { PrismaClient } from '@prisma/client';
import { generateBattleSlug } from '../utils/slugify.js';
import {
  assertConnectedToTestDatabase,
  assertTestDatabaseUrl,
} from '../tests/helpers/assertTestDatabase.js';
import { BATTLE_DEFS } from './battleSeedData.js';

// ── Guard ─────────────────────────────────────────────────────────────────────

/**
 * Refuse unless DATABASE_URL names a local throwaway AND the open connection
 * agrees. Runs before the first delete; on refusal nothing has been touched.
 *
 * The URL check runs first and refuses without a query, so a remote URL is
 * never even connected to. The connection check catches the case the string
 * cannot: the client resolved a different database than the one validated.
 */
export async function assertSeedTargetIsThrowaway(
  prisma: PrismaClient,
  databaseUrl: string | undefined
): Promise<void> {
  try {
    assertTestDatabaseUrl(databaseUrl);
    await assertConnectedToTestDatabase(prisma);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      [
        'REFUSING TO SEED BATTLES.',
        reason,
        '',
        'This seed DELETES every battle, participant, answer and leaderboard row, then reseeds five battles.',
        'It only runs against a local throwaway: DATABASE_URL must point at localhost / 127.0.0.1 with a',
        'database named *_test or *_e2e, and the live connection must report that same name. There is no override.',
        '  DATABASE_URL=postgresql://<you>@localhost:5434/eduscale_test npm run seed:battles',
        'Recipe: docs/QA_COVERAGE.md → "Running the default Playwright suite safely".',
      ].join('\n')
    );
  }
}

// ── Seed ──────────────────────────────────────────────────────────────────────

export interface SeededBattle {
  id: string;
  slug: string;
  title: string;
  source_type: string;
}

type SeedSourceType = 'topic' | 'subject' | 'main_concept' | 'roadmap' | 'none';

// One battle per source type, in BATTLE_DEFS order.
const SOURCE_TYPES: SeedSourceType[] = [
  'topic',
  'subject',
  'main_concept',
  'roadmap',
  'none',
];

const describeSource = (
  row: { id: string; label: string } | null,
  missing = 'NOT FOUND'
) => (row ? row.label + ' (' + row.id + ')' : missing);

/** Deletes every battle row, children first (cascade order). */
async function clearBattleData(prisma: PrismaClient): Promise<void> {
  console.log('Deleting all existing battle data...');
  await prisma.battleAnswer.deleteMany({});
  await prisma.battleQuestion.deleteMany({});
  await prisma.battleLeaderboard.deleteMany({});
  await prisma.battleParticipant.deleteMany({});
  await prisma.battle.deleteMany({});
  console.log('✓ All battle data cleared.\n');
}

/** Real source ids from the DB, so each battle points at a pool that exists. */
async function resolveSourceIds(
  prisma: PrismaClient
): Promise<Record<SeedSourceType, string | null>> {
  const [topic, subject, mainConcept, roadmap] = await Promise.all([
    prisma.topic.findFirst({ select: { id: true, title: true } }),
    prisma.subject.findFirst({ select: { id: true, title: true } }),
    prisma.mainConcept.findFirst({ select: { id: true, name: true } }),
    prisma.roadmap.findFirst({ select: { id: true, title: true } }),
  ]);

  const asRow = <T extends { id: string }>(
    r: T | null,
    label: (r: T) => string
  ) => (r ? { id: r.id, label: label(r) } : null);

  console.log('Source IDs resolved:');
  console.log(
    '  topic        : ' +
      describeSource(
        asRow(topic, (t) => t.title),
        'NOT FOUND — source_id will be null'
      )
  );
  console.log(
    '  subject      : ' + describeSource(asRow(subject, (s) => s.title))
  );
  console.log(
    '  main_concept : ' + describeSource(asRow(mainConcept, (m) => m.name))
  );
  console.log(
    '  roadmap      : ' + describeSource(asRow(roadmap, (r) => r.title))
  );
  console.log('');

  return {
    topic: topic?.id ?? null,
    subject: subject?.id ?? null,
    main_concept: mainConcept?.id ?? null,
    roadmap: roadmap?.id ?? null,
    none: null,
  };
}

/** Creates one battle with its slug and questions, and logs it. */
async function createSeedBattle(
  prisma: PrismaClient,
  def: (typeof BATTLE_DEFS)[number],
  creatorId: string,
  srcType: SeedSourceType,
  srcId: string | null
): Promise<SeededBattle> {
  const battle = await prisma.battle.create({
    data: {
      title: def.title,
      description: def.description,
      type: def.type,
      status: def.status,
      difficulty: def.difficulty,
      user_id: creatorId,
      topic_id: srcType === 'topic' ? srcId : null,
      question_source_type: srcType === 'none' ? null : srcType,
      question_source_id: srcType === 'none' ? null : srcId,
      max_participants: def.max_participants,
      total_questions: def.total_questions,
      time_per_question: def.time_per_question,
      points_per_question: def.points_per_question,
    },
  });

  // Generate and attach slug
  const slug = generateBattleSlug(battle.title, battle.id);
  await prisma.battle.update({ where: { id: battle.id }, data: { slug } });

  await prisma.battleQuestion.createMany({
    data: def.questions.map((q) => ({
      battle_id: battle.id,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      points: def.points_per_question,
      time_limit: def.time_per_question,
      order: q.order,
    })),
  });

  console.log(`✓ [${srcType.toUpperCase().padEnd(12)}] "${def.title}"`);
  console.log(`    id: ${battle.id}  slug: ${slug}`);
  console.log(
    `    source_id: ${srcId ?? '(none)'}  questions: ${def.questions.length}  type: ${def.type}  difficulty: ${def.difficulty}\n`
  );
  return { id: battle.id, slug, title: battle.title, source_type: srcType };
}

/**
 * The seed itself. Assumes the target has already been checked — call
 * runBattleSeeder() unless you are the test that proves the guard is in front.
 */
export async function seedBattles(
  prisma: PrismaClient
): Promise<{ created: number; battles: SeededBattle[] }> {
  await clearBattleData(prisma);

  const creator = await prisma.user.findFirst({
    select: { id: true, username: true },
    orderBy: { created_at: 'asc' },
  });
  if (!creator) throw new Error('No users found. Create a user first.');
  console.log(`Creator: ${creator.username} (${creator.id})\n`);

  const sourceIds = await resolveSourceIds(prisma);

  const battles: SeededBattle[] = [];
  for (let i = 0; i < BATTLE_DEFS.length; i++) {
    const srcType = SOURCE_TYPES[i];
    battles.push(
      await createSeedBattle(
        prisma,
        BATTLE_DEFS[i],
        creator.id,
        srcType,
        sourceIds[srcType]
      )
    );
  }

  console.log(
    `=== Done: ${battles.length} battles created, all fully playable ===`
  );
  return { created: battles.length, battles };
}

// ── Entry ─────────────────────────────────────────────────────────────────────

/**
 * The seeder path: guard, then seed. This is what `npm run seed:battles`
 * calls and what the unit test exercises.
 */
export async function runBattleSeeder(
  prisma: PrismaClient,
  databaseUrl: string | undefined
): Promise<{ created: number; battles: SeededBattle[] }> {
  console.log('=== Battle Seeder (5-type coverage) ===\n');
  await assertSeedTargetIsThrowaway(prisma, databaseUrl);
  return seedBattles(prisma);
}
