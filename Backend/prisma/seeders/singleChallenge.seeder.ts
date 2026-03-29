import { PrismaClient, Difficulty, ChallengeCategory, ChallengeStatus } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

interface ChallengeMeta {
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  points: number;
  tags: string[];
  company_tags: string[];
  topic_tags: string[];
  time_limit_ms: number;
  memory_limit_kb: number;
  input_format: string;
  output_format: string;
  example_input: string;
  example_output: string;
  constraints: string;
  function_signature: string;
  status: string;
}

interface TestCase {
  input: unknown;
  output: unknown;
  explanation?: string;
  is_hidden: boolean;
}

async function seedSingleChallenge(targetSlug: string) {
  const challengePath = path.join(process.cwd(), 'resources', 'challenges', targetSlug);

  if (!fs.existsSync(challengePath)) {
    console.error(`❌ Challenge folder not found: ${targetSlug}`);
    process.exit(1);
  }

  console.log(`🌱 Seeding challenge: ${targetSlug}`);

  try {
    const meta: ChallengeMeta = JSON.parse(fs.readFileSync(path.join(challengePath, 'meta.json'), 'utf-8'));
    const description = fs.readFileSync(path.join(challengePath, 'description.md'), 'utf-8');
    const editorial = fs.existsSync(path.join(challengePath, 'editorial.md')) 
      ? fs.readFileSync(path.join(challengePath, 'editorial.md'), 'utf-8') 
      : null;
    const hints: string[] = JSON.parse(fs.readFileSync(path.join(challengePath, 'hints.json'), 'utf-8'));
    const testCases: TestCase[] = JSON.parse(fs.readFileSync(path.join(challengePath, 'test_cases.json'), 'utf-8'));
    const solutions = fs.existsSync(path.join(challengePath, 'solution.ts'))
      ? { typescript: fs.readFileSync(path.join(challengePath, 'solution.ts'), 'utf-8') }
      : null;
    const boilerplates = fs.existsSync(path.join(challengePath, 'boilerplates.json'))
      ? JSON.parse(fs.readFileSync(path.join(challengePath, 'boilerplates.json'), 'utf-8'))
      : null;

    const challenge = await prisma.challenge.upsert({
      where: { title: meta.title },
      update: {
        description,
        points: meta.points,
        difficulty: meta.difficulty.toUpperCase() as Difficulty,
        category: meta.category as ChallengeCategory,
        input_format: meta.input_format,
        output_format: meta.output_format,
        example_input: meta.example_input,
        example_output: meta.example_output,
        constraints: meta.constraints,
        function_signature: meta.function_signature,
        time_limit: meta.time_limit_ms,
        memory_limit: meta.memory_limit_kb,
        tags: meta.tags,
        company_tags: meta.company_tags,
        hints,
        editorial,
        solutions,
        boilerplates,
        status: meta.status.toUpperCase() as ChallengeStatus,
        updated_at: new Date(),
      },
      create: {
        title: meta.title,
        description,
        points: meta.points,
        difficulty: meta.difficulty.toUpperCase() as Difficulty,
        category: meta.category as ChallengeCategory,
        input_format: meta.input_format,
        output_format: meta.output_format,
        example_input: meta.example_input,
        example_output: meta.example_output,
        constraints: meta.constraints,
        function_signature: meta.function_signature,
        time_limit: meta.time_limit_ms,
        memory_limit: meta.memory_limit_kb,
        tags: meta.tags,
        company_tags: meta.company_tags,
        hints,
        editorial,
        solutions,
        boilerplates,
        status: meta.status.toUpperCase() as ChallengeStatus,
      },
    });

    console.log(`✅ Challenge upserted: ${challenge.title} (${challenge.id})`);

    // Handle Test Cases
    await prisma.testCase.deleteMany({
      where: { challenge_id: challenge.id },
    });

    await prisma.testCase.createMany({
      data: testCases.map((tc) => ({
        challenge_id: challenge.id,
        input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
        output: typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output),
        is_hidden: tc.is_hidden,
      })),
    });

    console.log(`✅ Seeded ${testCases.length} test cases.`);

  } catch (error) {
    console.error(`❌ Error seeding ${targetSlug}:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

const slug = process.argv[2] || 'longest-substring-without-repeating-characters';
seedSingleChallenge(slug);
