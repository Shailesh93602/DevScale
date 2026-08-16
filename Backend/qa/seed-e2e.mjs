// Idempotent fixture seeder for the LOCAL e2e database.
//
// Why this exists: qa/run.mjs used to be pointed at the shared Supabase
// database, so every destructive assertion (article publish, battle create,
// quiz submit) mutated real data. This seeder builds the minimum content graph
// the harness needs — roadmap → main concept → subject → topic → quiz →
// questions/options, plus challenges, an approved article and a resource — so
// the whole suite can run against a throwaway local Postgres.
//
// Usage:
//   DATABASE_URL=postgresql://localhost:5432/eduscale_e2e \
//   DIRECT_URL=postgresql://localhost:5432/eduscale_e2e \
//   node qa/seed-e2e.mjs
//
// Safety: refuses to run unless DATABASE_URL points at localhost/127.0.0.1.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { resolveTestUsers } from './testUsers.mjs';

const url = process.env.DATABASE_URL || '';
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
  console.error(
    `REFUSING TO SEED: DATABASE_URL is not local (${url.replace(/:[^:@/]*@/, ':***@')}).\n` +
      'The e2e fixtures are destructive. Point DATABASE_URL at a local database.'
  );
  process.exit(2);
}

const prisma = new PrismaClient();
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

// Same accounts qa/run.mjs logs in as. Supabase remains the identity provider
// (sign-in is a read-only operation); the application rows live locally.
// Credentials come from the environment (see qa/testUsers.mjs) — never inline.
const PROFILES = {
  student: {
    username: 'teststudent',
    first_name: 'Test',
    last_name: 'Student',
    role: 'STUDENT',
  },
  student2: {
    username: 'battleplayer2',
    first_name: 'Battle',
    last_name: 'Player',
    role: 'STUDENT',
  },
  admin: {
    username: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    role: 'ADMIN',
  },
  moderator: {
    username: 'moderator',
    first_name: 'Moderator',
    last_name: 'User',
    role: 'MODERATOR',
  },
};

const credentials = resolveTestUsers();
export const QA_USERS = Object.fromEntries(
  Object.entries(PROFILES).map(([key, profile]) => [
    key,
    { ...credentials[key], ...profile },
  ])
);

async function seedUsers() {
  const roles = Object.fromEntries(
    (await prisma.role.findMany()).map((r) => [r.name, r.id])
  );
  for (const key of Object.keys(QA_USERS)) {
    const u = QA_USERS[key];
    const { data, error } = await sb.auth.signInWithPassword({
      email: u.email,
      password: u.password,
    });
    if (error) throw new Error(`sign-in ${u.email}: ${error.message}`);
    const supabaseId = data.user.id;
    await prisma.user.upsert({
      where: { supabase_id: supabaseId },
      update: {
        email: u.email,
        username: u.username,
        first_name: u.first_name,
        last_name: u.last_name,
        role_id: roles[u.role],
        is_verified: true,
        is_active: true,
      },
      create: {
        supabase_id: supabaseId,
        email: u.email,
        username: u.username,
        first_name: u.first_name,
        last_name: u.last_name,
        role_id: roles[u.role],
        is_verified: true,
      },
    });
    console.log(`  user ${u.email} → ${u.role}`);
  }
}

const QUESTIONS = [
  {
    q: 'Which HTTP status code means "Forbidden"?',
    correct: '403',
    wrong: ['401', '404', '500'],
  },
  {
    q: 'What does ACID stand for in databases?',
    correct: 'Atomicity, Consistency, Isolation, Durability',
    wrong: [
      'Access, Control, Identity, Domain',
      'Async, Cache, Index, Data',
      'Atomic, Cached, Indexed, Durable',
    ],
  },
  {
    q: 'Which data structure gives O(1) average lookup?',
    correct: 'Hash table',
    wrong: ['Linked list', 'Binary search tree', 'Array'],
  },
  {
    q: 'What is the time complexity of binary search?',
    correct: 'O(log n)',
    wrong: ['O(n)', 'O(n log n)', 'O(1)'],
  },
  {
    q: 'Which Redis command sets a key with a TTL?',
    correct: 'SETEX',
    wrong: ['SET', 'EXPIREAT', 'TTL'],
  },
  {
    q: 'In Postgres, which isolation level prevents phantom reads?',
    correct: 'Serializable',
    wrong: ['Read committed', 'Read uncommitted', 'Repeatable read'],
  },
  {
    q: 'What does a circuit breaker do when it is OPEN?',
    correct: 'Fails fast without calling the dependency',
    wrong: [
      'Retries the dependency forever',
      'Queues calls until the dependency recovers',
      'Calls the dependency with a longer timeout',
    ],
  },
  {
    q: 'Which header carries a bearer token?',
    correct: 'Authorization',
    wrong: ['X-Auth', 'Cookie', 'WWW-Authenticate'],
  },
];

async function seedContent() {
  const category = await prisma.roadmapCategory.upsert({
    where: { name: 'QA Fixtures' },
    update: {},
    create: { name: 'QA Fixtures', description: 'Deterministic e2e content' },
  });

  const owner = await prisma.user.findFirst({ where: { username: 'admin' } });

  const roadmap = await prisma.roadmap.upsert({
    where: { title: 'QA E2E Roadmap' },
    update: { is_public: true },
    create: {
      title: 'QA E2E Roadmap',
      slug: 'qa-e2e-roadmap',
      description: 'Fixture roadmap used by the e2e harness.',
      user_id: owner.id,
      is_public: true,
      difficulty: 'BEGINNER',
      estimatedHours: 4,
      category_id: category.id,
    },
  });

  const mainConcept = await prisma.mainConcept.upsert({
    where: { name: 'QA E2E Main Concept' },
    update: {},
    create: {
      name: 'QA E2E Main Concept',
      slug: 'qa-e2e-main-concept',
      description: 'Fixture main concept.',
      order: 1,
    },
  });

  const subject = await prisma.subject.upsert({
    where: { title: 'QA E2E Subject' },
    update: {},
    create: {
      title: 'QA E2E Subject',
      slug: 'qa-e2e-subject',
      description: 'Fixture subject.',
      order: 1,
    },
  });

  const topic =
    (await prisma.topic.findFirst({ where: { title: 'QA E2E Topic' } })) ??
    (await prisma.topic.create({
      data: {
        title: 'QA E2E Topic',
        slug: 'qa-e2e-topic',
        description: 'Fixture topic with a real quiz behind it.',
        order: 1,
        content: '# QA E2E Topic\n\nFixture content.',
        resources: [],
        prerequisites: [],
      },
    }));

  await prisma.roadmapMainConcept.upsert({
    where: {
      roadmap_id_main_concept_id: {
        roadmap_id: roadmap.id,
        main_concept_id: mainConcept.id,
      },
    },
    update: {},
    create: {
      roadmap_id: roadmap.id,
      main_concept_id: mainConcept.id,
      order: 1,
    },
  });
  await prisma.mainConceptSubject.upsert({
    where: {
      main_concept_id_subject_id: {
        main_concept_id: mainConcept.id,
        subject_id: subject.id,
      },
    },
    update: {},
    create: {
      main_concept_id: mainConcept.id,
      subject_id: subject.id,
      order: 1,
    },
  });
  await prisma.subjectTopic.upsert({
    where: {
      subject_id_topic_id: { subject_id: subject.id, topic_id: topic.id },
    },
    update: {},
    create: { subject_id: subject.id, topic_id: topic.id, order: 1 },
  });
  await prisma.roadmapTopic.upsert({
    where: {
      roadmap_id_topic_id: { roadmap_id: roadmap.id, topic_id: topic.id },
    },
    update: {},
    create: { roadmap_id: roadmap.id, topic_id: topic.id, order: 1 },
  });

  // Quiz + canonical Question/Option rows. The battle question pool reads these
  // same rows, so one fixture powers both the quiz flow and battle sourcing.
  let quiz = await prisma.quiz.findFirst({
    where: { title: 'QA E2E Quiz', topic_id: topic.id },
  });
  if (!quiz) {
    quiz = await prisma.quiz.create({
      data: {
        title: 'QA E2E Quiz',
        description: 'Fixture quiz.',
        type: 'PRACTICE',
        time_limit: 600,
        passing_score: 50,
        topic_id: topic.id,
        subject_id: subject.id,
      },
    });
  }
  const existing = await prisma.question.count({ where: { quiz_id: quiz.id } });
  if (existing < QUESTIONS.length) {
    await prisma.question.deleteMany({ where: { quiz_id: quiz.id } });
    for (const item of QUESTIONS) {
      const question = await prisma.question.create({
        data: {
          quiz_id: quiz.id,
          question: item.q,
          type: 'MULTIPLE_CHOICE',
          correct_answer: item.correct,
          points: 100,
        },
      });
      // Deterministic option order: the pool derives the correct index from
      // `Option.text === Question.correct_answer`, so both signals are set.
      const texts = [item.correct, ...item.wrong];
      for (const text of texts) {
        await prisma.option.create({
          data: {
            question_id: question.id,
            text,
            is_correct: text === item.correct,
          },
        });
      }
    }
  }

  // Coding challenges (challenge list/detail, drafts, submit).
  const challenges = [
    {
      title: 'QA E2E Two Sum',
      difficulty: 'EASY',
      category: 'arrays',
      points: 100,
    },
    {
      title: 'QA E2E Reverse String',
      difficulty: 'EASY',
      category: 'strings',
      points: 50,
    },
  ];
  for (const c of challenges) {
    await prisma.challenge.upsert({
      where: { title: c.title },
      update: {},
      create: {
        title: c.title,
        description: `Fixture challenge: ${c.title}.`,
        points: c.points,
        difficulty: c.difficulty,
        category: c.category,
        input_format: 'An array of integers.',
        output_format: 'An integer.',
        example_input: '[1,2,3]',
        example_output: '6',
        constraints: '1 <= n <= 1000',
        function_signature: 'function solve(nums) {}',
        tags: ['fixture'],
        company_tags: [],
        hints: ['Use a hash map.'],
        editorial: 'Iterate once, store complements.',
        topic_id: topic.id,
        status: 'ACTIVE',
      },
    });
  }

  // A challenge whose markdown-rendered fields carry a live XSS payload. The
  // frontend renders description / input+output format / editorial through
  // <ReactMarkdown>; this fixture is what proves that path cannot execute.
  // The payload sets window.__XSS_FIRED so the assertion is "did it run", not
  // "was some string escaped".
  const XSS_MD = [
    '# Probe',
    '',
    '<img src=x onerror="window.__XSS_FIRED=1">',
    '<script>window.__XSS_FIRED=1</script>',
    '',
    '[click me](javascript:window.__XSS_FIRED=1)',
    '',
    'Inert probe body.',
  ].join('\n');
  await prisma.challenge.upsert({
    where: { title: 'QA E2E XSS Probe' },
    update: {
      description: XSS_MD,
      editorial: XSS_MD,
      hints: [XSS_MD],
      input_format: XSS_MD,
      output_format: XSS_MD,
    },
    create: {
      title: 'QA E2E XSS Probe',
      description: XSS_MD,
      points: 10,
      difficulty: 'EASY',
      category: 'security',
      input_format: XSS_MD,
      output_format: XSS_MD,
      example_input: '1',
      example_output: '1',
      constraints: 'n/a',
      function_signature: 'function solve() {}',
      tags: ['fixture', 'security'],
      company_tags: [],
      hints: [XSS_MD],
      editorial: XSS_MD,
      topic_id: topic.id,
      status: 'ACTIVE',
    },
  });

  // An APPROVED article so the public article-detail assertions have a target.
  const article = await prisma.article.findFirst({
    where: { title: 'QA E2E Published Article' },
  });
  if (!article) {
    await prisma.article.create({
      data: {
        title: 'QA E2E Published Article',
        content: '<p>Fixture article body.</p>',
        author_id: owner.id,
        topic_id: topic.id,
        status: 'APPROVED',
      },
    });
  }

  const resource = await prisma.resource.findFirst({
    where: { title: 'QA E2E Resource' },
  });
  if (!resource) {
    await prisma.resource.create({
      data: {
        title: 'QA E2E Resource',
        description: 'Fixture resource.',
        content: 'Fixture resource body.',
        type: 'article',
        url: 'https://example.com/qa-e2e',
        category: 'backend',
        difficulty: 'EASY',
        language: 'en',
        user_id: owner.id,
      },
    });
  }

  console.log(
    `  content: roadmap=${roadmap.id.slice(0, 8)} topic=${topic.id.slice(0, 8)} quiz=${quiz.id.slice(0, 8)} questions=${QUESTIONS.length}`
  );
}

async function main() {
  console.log('Seeding e2e fixtures into', url.replace(/:[^:@/]*@/, ':***@'));
  await seedUsers();
  await seedContent();
  await prisma.$disconnect();
  console.log('Done.');
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
