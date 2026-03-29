import { PrismaClient, Difficulty, ChallengeCategory, ChallengeStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ChallengeMeta {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  points?: number;
  tags: string[];
  company_tags: string[];
  time_limit_ms?: number;
  memory_limit_kb?: number;
  input_format: string;
  output_format: string;
  example_input: string;
  example_output: string;
  constraints: string;
  function_signature: string;
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  topic_tags?: string[];
  supported_languages?: string[];
  is_production_ready?: boolean;
}

interface TestCase {
  input: unknown;
  output: unknown;
  explanation?: string;
  is_hidden: boolean;
}

interface Boilerplates {
  typescript?: string;
  javascript?: string;
  python?: string;
  java?: string;
  cpp?: string;
  go?: string;
  rust?: string;
  csharp?: string;
  [key: string]: string | undefined;
}

interface ChallengeFolder {
  slug: string;
  folderPath: string;
  meta: ChallengeMeta;
  description: string;
  hints: string[];
  editorial: string | null;
  test_cases: TestCase[];
  solution: string | null;
  boilerplates: Boilerplates | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mapDifficulty(d: string): Difficulty {
  const map: Record<string, Difficulty> = {
    Easy: Difficulty.EASY,
    Medium: Difficulty.MEDIUM,
    Hard: Difficulty.HARD,
  };
  return map[d] ?? Difficulty.EASY;
}

function mapCategory(c: string): ChallengeCategory {
  const valid = Object.values(ChallengeCategory) as string[];
  return valid.includes(c) ? (c as ChallengeCategory) : ChallengeCategory.algorithms;
}

function calcPoints(difficulty: string, override?: number): number {
  if (override && override > 0) return override;
  return difficulty === 'Easy' ? 50 : difficulty === 'Medium' ? 100 : 200;
}

function readFileIfExists(filePath: string): string | null {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8').trim();
  }
  return null;
}

function readJsonIfExists<T>(filePath: string): T | null {
  const content = readFileIfExists(filePath);
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch (e) {
    console.warn(`  ⚠️  Invalid JSON in ${filePath}: ${e}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Loader: walk resources/challenges/** folders
// ─────────────────────────────────────────────────────────────────────────────

const CHALLENGES_DIR = path.resolve(__dirname, '../../resources/challenges');

function loadChallengeFolders(): ChallengeFolder[] {
  if (!fs.existsSync(CHALLENGES_DIR)) {
    console.error(`❌ Challenges directory not found: ${CHALLENGES_DIR}`);
    return [];
  }

  const folders = fs
    .readdirSync(CHALLENGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort(); // alphabetical order

  const challenges: ChallengeFolder[] = [];

  for (const slug of folders) {
    const folderPath = path.join(CHALLENGES_DIR, slug);

    // Required: meta.json
    const meta = readJsonIfExists<ChallengeMeta>(path.join(folderPath, 'meta.json'));
    if (!meta) {
      console.warn(`  ⚠️  Skipping ${slug} — missing or invalid meta.json`);
      continue;
    }
    meta.slug = meta.slug ?? slug;

    // Required: description.md
    const description = readFileIfExists(path.join(folderPath, 'description.md'));
    if (!description) {
      console.warn(`  ⚠️  Skipping ${slug} — missing description.md`);
      continue;
    }

    // Required: test_cases.json
    const test_cases = readJsonIfExists<TestCase[]>(path.join(folderPath, 'test_cases.json'));
    if (!test_cases || test_cases.length === 0) {
      console.warn(`  ⚠️  Skipping ${slug} — missing or empty test_cases.json`);
      continue;
    }

    // Optional
    const hints = readJsonIfExists<string[]>(path.join(folderPath, 'hints.json')) ?? [];
    const editorial = readFileIfExists(path.join(folderPath, 'editorial.md'));
    const solution = readFileIfExists(path.join(folderPath, 'solution.ts'));
    const boilerplates = readJsonIfExists<Boilerplates>(path.join(folderPath, 'boilerplates.json'));

    challenges.push({ slug, folderPath, meta, description, hints, editorial, test_cases, solution, boilerplates });
  }

  return challenges;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seeder
// ─────────────────────────────────────────────────────────────────────────────

const seedChallenges = async () => {
  try {
    const challenges = loadChallengeFolders();
    console.log(`\n🌱 Master Challenge Seeder — found ${challenges.length} challenge folders\n`);

    if (challenges.length === 0) {
      console.log('No challenges to seed.');
      return;
    }

    // Build topic lookup map
    const allTopics = await prisma.topic.findMany({ select: { id: true, title: true } });
    const topicByTitle = new Map<string, string>(allTopics.map((t) => [t.title.toLowerCase(), t.id]));

    let seeded = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const [idx, c] of challenges.entries()) {
      // Only seed production-ready challenges
      if (c.meta.status === 'DRAFT' || c.meta.is_production_ready === false) {
        skipped++;
        console.log(`  淡  [${idx + 1}/${challenges.length}] ${c.meta.title} — NOT PRODUCTION READY (skipped)`);
        continue;
      }

      try {
        // Resolve topic link (try topic_tags first, then tags)
        const searchTags = [...(c.meta.topic_tags ?? []), ...c.meta.tags];
        const topicId = searchTags.map((t) => topicByTitle.get(t.toLowerCase())).find(Boolean) ?? null;

        const exists = await prisma.challenge.findUnique({ where: { title: c.meta.title }, select: { id: true } });

        const data = {
          title: c.meta.title,
          description: c.description,
          difficulty: mapDifficulty(c.meta.difficulty),
          category: mapCategory(c.meta.category),
          points: calcPoints(c.meta.difficulty, c.meta.points),
          tags: c.meta.tags,
          company_tags: c.meta.company_tags,
          hints: c.hints,
          editorial: c.editorial ?? null,
          input_format: c.meta.input_format,
          output_format: c.meta.output_format,
          example_input: c.meta.example_input ?? '',
          example_output: c.meta.example_output ?? '',
          constraints: c.meta.constraints,
          function_signature: c.meta.function_signature,
          time_limit: c.meta.time_limit_ms ?? 2000,
          memory_limit: c.meta.memory_limit_kb ?? 262144,
          solutions: c.solution ? { typescript: c.solution } : undefined,
          boilerplates: c.boilerplates ?? undefined,
          status: (c.meta.status as ChallengeStatus) ?? ChallengeStatus.ACTIVE,
          ...(topicId ? { topic_id: topicId } : {}),
        };

        const challenge = await prisma.challenge.upsert({
          where: { title: c.meta.title },
          update: data,
          create: data,
        });

        // Re-create test cases for idempotency
        await prisma.testCase.deleteMany({ where: { challenge_id: challenge.id } });
        await prisma.testCase.createMany({
          data: c.test_cases.map((tc) => ({
            challenge_id: challenge.id,
            input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
            output: typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output),
            is_hidden: tc.is_hidden,
          })),
        });

        if (exists) {
          updated++;
        } else {
          seeded++;
        }

        const icon = exists ? '♻️ ' : '✅';
        console.log(`  ${icon} [${idx + 1}/${challenges.length}] ${c.meta.title} (${c.test_cases.length} test cases)`);
      } catch (err) {
        errors++;
        console.error(`  ❌ [${idx + 1}] ${c.meta.title} — ${(err as Error).message}`);
      }
    }

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎉 Challenge seeding complete!
  ✅ Created : ${seeded}
  ♻️  Updated : ${updated}
  ⏭️  Skipped : ${skipped}
  ❌ Errors  : ${errors}
  📦 Total   : ${challenges.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  } catch (err) {
    console.error('❌ Fatal error in challenge seeder:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedChallenges();
