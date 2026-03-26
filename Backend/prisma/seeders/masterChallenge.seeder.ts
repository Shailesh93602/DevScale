import { PrismaClient, Difficulty, ChallengeCategory, ChallengeStatus, Prisma } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

const CHALLENGES_DIR = path.join(process.cwd(), 'resources', 'challenges');

// ── Types ──────────────────────────────────────────────────────────────────
interface ChallengeMeta {
  title: string;
  difficulty: string;
  category: string;
  points?: number;
  tags: string[];
  company_tags: string[];
  topic_tags?: string[];
  time_limit_ms?: number;
  memory_limit_kb?: number;
  input_format: string;
  output_format: string;
  example_input?: string;
  example_output?: string;
  constraints: string;
  function_signature: string;
  status: string;
}

interface TestCase {
  input: unknown;
  output: unknown;
  is_hidden: boolean;
}

interface ChallengeFolder {
  slug: string;
  meta: ChallengeMeta;
  description: string;
  test_cases: TestCase[];
  solution?: string;
  hints: string[];
  editorial?: string;
  boilerplates?: Prisma.InputJsonValue;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function mapDifficulty(d: string): Difficulty {
  const map: Record<string, Difficulty> = {
    Easy: Difficulty.EASY,
    Medium: Difficulty.MEDIUM,
    Hard: Difficulty.HARD,
  };
  const diff = d.toUpperCase();
  if (diff === 'INTERMEDIATE') return Difficulty.MEDIUM;
  if (Object.values(Difficulty).includes(diff as Difficulty)) return diff as Difficulty;
  return map[d] ?? Difficulty.EASY;
}

function mapCategory(c: string): ChallengeCategory {
  const valid = Object.values(ChallengeCategory) as string[];
  return valid.includes(c) ? (c as ChallengeCategory) : ChallengeCategory.algorithms;
}

function calcPoints(difficulty: string, override?: number): number {
  if (override && override > 0) return override;
  if (difficulty === 'Easy') return 50;
  if (difficulty === 'Medium') return 100;
  return 200;
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
  } catch (err) {
    console.error(`  ❌ Error parsing JSON at ${filePath}:`, err);
    return null;
  }
}

function loadChallengeFolders(): ChallengeFolder[] {
  if (!fs.existsSync(CHALLENGES_DIR)) {
    console.error(`❌ Challenges directory not found: ${CHALLENGES_DIR}`);
    return [];
  }

  const folders = fs
    .readdirSync(CHALLENGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  const challenges: ChallengeFolder[] = [];

  for (const slug of folders) {
    const folderPath = path.join(CHALLENGES_DIR, slug);
    const meta = readJsonIfExists<ChallengeMeta>(path.join(folderPath, 'meta.json'));
    if (!meta) {
      console.warn(`  ⚠️ Skipping ${slug} — missing or invalid meta.json`);
      continue;
    }

    const description = readFileIfExists(path.join(folderPath, 'description.md')) || 'No description available.';
    const test_cases = readJsonIfExists<TestCase[]>(path.join(folderPath, 'test_cases.json')) || [];
    const hints = readJsonIfExists<string[]>(path.join(folderPath, 'hints.json')) || [];
    const editorial = readFileIfExists(path.join(folderPath, 'editorial.md')) || undefined;
    const boilerplates = readJsonIfExists<Prisma.InputJsonValue>(path.join(folderPath, 'boilerplates.json')) || undefined;
    const solution = readFileIfExists(path.join(folderPath, 'solution.ts')) || undefined;

    challenges.push({ slug, meta, description, test_cases, hints, editorial, boilerplates, solution });
  }

  return challenges;
}

// ── Seeder logic ─────────────────────────────────────────────────────────────

async function upsertChallenge(c: ChallengeFolder, topicId: string, idx: number, total: number) {
  const exists = await prisma.challenge.findUnique({
    where: { title: c.meta.title } as Prisma.ChallengeWhereUniqueInput,
    select: { id: true },
  });

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
    topic: { connect: { id: topicId } },
  };

  const challenge = await prisma.challenge.upsert({
    where: { title: c.meta.title } as Prisma.ChallengeWhereUniqueInput,
    update: data,
    create: data,
  });

  await prisma.testCase.deleteMany({ where: { challenge_id: challenge.id } });
  await prisma.testCase.createMany({
    data: c.test_cases.map((tc) => ({
      challenge_id: challenge.id,
      input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
      output: typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output),
      is_hidden: tc.is_hidden,
    })),
  });

  const icon = exists ? '♻️ ' : '✅';
  const prefix = exists ? 'Updated' : 'Created';
  console.log(`  ${icon} [${idx + 1}/${total}] ${prefix}: ${c.meta.title} (${c.test_cases.length} test cases)`);

  return Boolean(exists);
}

const seedChallenges = async () => {
  try {
    const challenges = loadChallengeFolders();
    console.log(`\n🌱 Master Challenge Seeder — found ${challenges.length} challenge folders\n`);

    if (challenges.length === 0) return;

    const allTopics = await prisma.topic.findMany({ select: { id: true, title: true } });
    const topicByTitle = new Map<string, string>(allTopics.map((t) => [t.title.toLowerCase(), t.id]));

    let seeded = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const [idx, c] of challenges.entries()) {
      if (c.meta.status === 'DRAFT') {
        skipped++;
        console.log(`  ⏭️  [${idx + 1}/${challenges.length}] ${c.meta.title} — DRAFT (skipped)`);
        continue;
      }

      try {
        const searchTags = [...(c.meta.topic_tags ?? []), ...c.meta.tags];
        const topicId = searchTags.map((t) => topicByTitle.get(t.toLowerCase())).find(Boolean) ?? null;

        if (!topicId) {
          console.warn(`  ⚠️  [${idx + 1}/${challenges.length}] ${c.meta.title} — No matching topic found (skipped)`);
          skipped++;
          continue;
        }

        const isUpdated = await upsertChallenge(c, topicId, idx, challenges.length);
        if (isUpdated) updated++;
        else seeded++;
      } catch (err) {
        errors++;
        console.error(`  ❌ [${idx + 1}/${challenges.length}] ${c.meta.title} — Failed:`, err);
      }
    }

    console.log(`\n━━━━━━━━━━━━━━━━ Challenge Summary ━━━━━━━━━━━━━━━━
  ✅ Seeded  : ${seeded}
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
