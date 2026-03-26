/**
 * seed-battles.ts
 *
 * Clears all battle data and seeds 5 fully-playable test battles, one for each
 * question source type:
 *   1. topic       — QUICK   EASY    (topic-level scope)
 *   2. subject     — QUICK   MEDIUM  (subject-level scope)
 *   3. main_concept — SCHEDULED MEDIUM (main-concept-level scope)
 *   4. roadmap     — PRACTICE HARD   (roadmap-level scope)
 *   5. (manual)    — PRACTICE EASY   (no pool source — hardcoded questions only)
 *
 * Run:  npm run seed:battles
 *       (or: cd Backend && npm run seed:battles)
 */

import { PrismaClient, BattleType, Difficulty, BattleStatus } from '@prisma/client';
import { generateBattleSlug } from '../utils/slugify';

const prisma = new PrismaClient();

// ── Question bank ─────────────────────────────────────────────────────────────
// Each battle ships with 5 standalone MCQ questions so it is always playable
// even if the Quiz pool is empty in this environment.

const QUESTIONS = {
  dataStructures: [
    {
      question: 'What is the time complexity of accessing an element by index in an array?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correct_answer: 0,
      explanation: 'Arrays are stored in contiguous memory, so index access is always O(1).',
      order: 1,
    },
    {
      question: 'Which data structure follows the LIFO principle?',
      options: ['Queue', 'Stack', 'Deque', 'Priority Queue'],
      correct_answer: 1,
      explanation: 'A stack pushes and pops from the same end — last in, first out.',
      order: 2,
    },
    {
      question: 'What is the main advantage of a linked list over an array?',
      options: ['O(1) random access', 'Better cache performance', 'Dynamic O(1) insertion/deletion at known position', 'Less memory'],
      correct_answer: 2,
      explanation: 'Linked lists grow dynamically and allow O(1) insert/delete at a known node.',
      order: 3,
    },
    {
      question: 'In a binary search tree (BST), where is the smallest element?',
      options: ['Root', 'Rightmost node', 'Leftmost node', 'Any leaf'],
      correct_answer: 2,
      explanation: 'By BST property every left child is smaller, so the leftmost node is the minimum.',
      order: 4,
    },
    {
      question: 'Which operation is O(n) on a singly linked list (no tail pointer)?',
      options: ['Insert at head', 'Delete at head', 'Access last element', 'Check if empty'],
      correct_answer: 2,
      explanation: 'Without a tail pointer you must traverse all n nodes to reach the last element.',
      order: 5,
    },
  ],

  algorithms: [
    {
      question: 'What is the average-case time complexity of binary search?',
      options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
      correct_answer: 2,
      explanation: 'Binary search halves the search space each step — O(log n) comparisons.',
      order: 1,
    },
    {
      question: 'Which sorting algorithm has O(n²) average-case complexity?',
      options: ['Merge Sort', 'Heap Sort', 'Quick Sort', 'Bubble Sort'],
      correct_answer: 3,
      explanation: 'Bubble Sort performs n*(n-1)/2 comparisons on average — O(n²).',
      order: 2,
    },
    {
      question: 'What two properties must a problem have for dynamic programming to apply?',
      options: ['Greedy + optimal substructure', 'Optimal substructure + overlapping subproblems', 'Divide & conquer + memoization', 'Polynomial time + NP-hardness'],
      correct_answer: 1,
      explanation: 'DP needs overlapping subproblems (reusable solutions) and optimal substructure.',
      order: 3,
    },
    {
      question: "What constraint must hold for Dijkstra's algorithm to be correct?",
      options: ['Graph must be a tree', 'Graph must be acyclic', 'All edge weights non-negative', 'Graph must be undirected'],
      correct_answer: 2,
      explanation: "Dijkstra's greedy relaxation breaks with negative weights — use Bellman-Ford instead.",
      order: 4,
    },
    {
      question: 'What is the space complexity of merge sort?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correct_answer: 2,
      explanation: 'Merge sort needs O(n) auxiliary space for the temporary merge arrays.',
      order: 5,
    },
  ],

  webDev: [
    {
      question: 'What does CSS stand for?',
      options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Specification', 'Colorful Styling Standard'],
      correct_answer: 1,
      explanation: '"Cascading" refers to how styles from multiple sources are combined by specificity.',
      order: 1,
    },
    {
      question: 'Which HTTP method is idempotent AND safe?',
      options: ['POST', 'PUT', 'DELETE', 'GET'],
      correct_answer: 3,
      explanation: 'GET is both safe (no side effects) and idempotent (repeatable without different results).',
      order: 2,
    },
    {
      question: 'What does the `async` keyword do to a JavaScript function?',
      options: ['Runs it on a separate thread', 'Makes it return a Promise', 'Prevents it throwing errors', 'Blocks until complete'],
      correct_answer: 1,
      explanation: 'An async function always returns a Promise; plain return values are auto-wrapped.',
      order: 3,
    },
    {
      question: 'Which React hook handles side effects like data fetching?',
      options: ['useState', 'useContext', 'useEffect', 'useReducer'],
      correct_answer: 2,
      explanation: '`useEffect` runs after render — the correct place for subscriptions, fetches, etc.',
      order: 4,
    },
    {
      question: 'What does REST stand for?',
      options: ['Remote Event Streaming Technology', 'Reliable Server Transfer', 'Representational State Transfer', 'Restricted Service Transmission'],
      correct_answer: 2,
      explanation: 'REST (Representational State Transfer) was defined by Roy Fielding in 2000.',
      order: 5,
    },
  ],

  systemDesign: [
    {
      question: 'Which database type is best suited for highly relational, structured data with ACID guarantees?',
      options: ['Document DB (MongoDB)', 'Key-Value store (Redis)', 'Relational DB (PostgreSQL)', 'Wide-column (Cassandra)'],
      correct_answer: 2,
      explanation: 'Relational databases like PostgreSQL provide full ACID properties and enforce referential integrity.',
      order: 1,
    },
    {
      question: 'What does CAP theorem state?',
      options: ['Consistent + Available + Partition-tolerant all achievable', 'Choose at most 2 of: Consistency, Availability, Partition tolerance', 'Cache + API + Proxy are required', 'Clustering needs at least 3 nodes'],
      correct_answer: 1,
      explanation: 'CAP: a distributed system can guarantee at most 2 of the 3 properties simultaneously.',
      order: 2,
    },
    {
      question: 'What is horizontal scaling?',
      options: ['Upgrading CPU/RAM of one server', 'Adding more servers to distribute load', 'Increasing disk IOPS', 'Using a faster network'],
      correct_answer: 1,
      explanation: 'Horizontal scaling adds more machines ("scale out") vs vertical scaling that upgrades a single machine.',
      order: 3,
    },
    {
      question: 'Which caching strategy writes data to both cache and DB simultaneously?',
      options: ['Cache-aside', 'Write-through', 'Write-behind', 'Refresh-ahead'],
      correct_answer: 1,
      explanation: 'Write-through keeps cache and DB in sync by writing both on every update.',
      order: 4,
    },
    {
      question: 'What is the primary purpose of a message queue (e.g. RabbitMQ)?',
      options: ['Synchronous inter-service calls', 'Decoupling producers and consumers for async processing', 'Storing persistent data', 'Load balancing HTTP traffic'],
      correct_answer: 1,
      explanation: 'Message queues decouple producers from consumers so services can process messages independently.',
      order: 5,
    },
  ],

  generalCS: [
    {
      question: 'What is the difference between a process and a thread?',
      options: ['No difference — same thing', 'A process has its own memory space; threads share process memory', 'Threads are slower than processes', 'Processes share memory; threads have separate memory'],
      correct_answer: 1,
      explanation: 'Processes are independent with isolated memory. Threads are lighter units within a process sharing the same memory.',
      order: 1,
    },
    {
      question: 'What does SOLID stand for in software engineering?',
      options: ['Simple, Open, Linked, Interface, Dependency', 'Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion', 'Scalable, Object-oriented, Lightweight, Integrated, Deployable', 'None of the above'],
      correct_answer: 1,
      explanation: 'SOLID is five OOP design principles: SRP, OCP, LSP, ISP, DIP.',
      order: 2,
    },
    {
      question: 'What is Big-O notation used for?',
      options: ['Measuring exact execution time', 'Describing algorithm performance relative to input size', 'Counting total operations', 'Profiling memory leaks'],
      correct_answer: 1,
      explanation: 'Big-O describes the upper bound growth rate of an algorithm as input size n grows.',
      order: 3,
    },
    {
      question: 'Which TCP/IP layer handles routing between networks?',
      options: ['Application', 'Transport', 'Network (Internet)', 'Data Link'],
      correct_answer: 2,
      explanation: 'The Network (Internet) layer routes packets between different networks using IP addresses.',
      order: 4,
    },
    {
      question: 'What is garbage collection in programming languages?',
      options: ['Deleting unused files from disk', 'Automatic reclamation of heap memory no longer reachable', 'Removing dead code at compile time', 'Cleaning up database records'],
      correct_answer: 1,
      explanation: 'GC automatically frees heap memory for objects no longer referenced, preventing memory leaks.',
      order: 5,
    },
  ],
};

// ── Battle definitions ─────────────────────────────────────────────────────────

interface BattleSeedDef {
  title: string;
  description: string;
  type: BattleType;
  status: BattleStatus;
  difficulty: Difficulty;
  max_participants: number;
  total_questions: number;
  time_per_question: number;
  points_per_question: number;
  source_label: string;           // human label for console output
  source_type: string | null;     // question_source_type
  questions: typeof QUESTIONS.dataStructures;
}

const BATTLE_DEFS: Omit<BattleSeedDef, 'source_type'>[] = [
  {
    title: '[TOPIC] Data Structures Showdown',
    description: 'Topic-sourced battle covering arrays, linked lists, stacks, queues, and trees. Ready to play in 30s/question.',
    type: 'QUICK',
    status: 'WAITING',
    difficulty: 'EASY',
    max_participants: 6,
    total_questions: 5,
    time_per_question: 30,
    points_per_question: 100,
    source_label: 'topic',
    questions: QUESTIONS.dataStructures,
  },
  {
    title: '[SUBJECT] Algorithm Mastery Sprint',
    description: 'Subject-sourced battle: sorting, searching, dynamic programming, and graph algorithms. Medium difficulty.',
    type: 'QUICK',
    status: 'WAITING',
    difficulty: 'MEDIUM',
    max_participants: 4,
    total_questions: 5,
    time_per_question: 45,
    points_per_question: 150,
    source_label: 'subject',
    questions: QUESTIONS.algorithms,
  },
  {
    title: '[MAIN CONCEPT] System Design Fundamentals',
    description: 'Main-concept-sourced scheduled battle: databases, CAP theorem, scaling, caching, and message queues.',
    type: 'SCHEDULED',
    status: 'WAITING',
    difficulty: 'MEDIUM',
    max_participants: 8,
    total_questions: 5,
    time_per_question: 45,
    points_per_question: 150,
    source_label: 'main_concept',
    questions: QUESTIONS.systemDesign,
  },
  {
    title: '[ROADMAP] Full-Stack Web Dev Challenge',
    description: 'Roadmap-sourced practice battle: HTML/CSS, HTTP, JavaScript, React, and REST. Hard difficulty — all layers covered.',
    type: 'PRACTICE',
    status: 'WAITING',
    difficulty: 'HARD',
    max_participants: 10,
    total_questions: 5,
    time_per_question: 60,
    points_per_question: 200,
    source_label: 'roadmap',
    questions: QUESTIONS.webDev,
  },
  {
    title: '[PRACTICE] CS Fundamentals Free Play',
    description: 'Practice battle with no pool source — hardcoded general CS questions. Processes, SOLID, Big-O, networking, GC.',
    type: 'PRACTICE',
    status: 'WAITING',
    difficulty: 'EASY',
    max_participants: 4,
    total_questions: 5,
    time_per_question: 30,
    points_per_question: 100,
    source_label: 'none',
    questions: QUESTIONS.generalCS,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Battle Seeder (5-type coverage) ===\n');

  // ── 1. Clean up all existing battle data (cascade order) ──────────────────
  console.log('Deleting all existing battle data...');
  await prisma.battleAnswer.deleteMany({});
  await prisma.battleQuestion.deleteMany({});
  await prisma.battleLeaderboard.deleteMany({});
  await prisma.battleParticipant.deleteMany({});
  await prisma.battle.deleteMany({});
  console.log('✓ All battle data cleared.\n');

  // ── 2. Find seeder user ───────────────────────────────────────────────────
  const creator = await prisma.user.findFirst({
    select: { id: true, username: true },
    orderBy: { created_at: 'asc' },
  });
  if (!creator) throw new Error('No users found. Create a user first.');
  console.log(`Creator: ${creator.username} (${creator.id})\n`);

  // ── 3. Fetch real source IDs from DB ──────────────────────────────────────
  const [topic, subject, mainConcept, roadmap] = await Promise.all([
    prisma.topic.findFirst({ select: { id: true, title: true } }),
    prisma.subject.findFirst({ select: { id: true, title: true } }),
    prisma.mainConcept.findFirst({ select: { id: true, name: true } }),
    prisma.roadmap.findFirst({ select: { id: true, title: true } }),
  ]);

  const fmtTopic      = topic       ? topic.title + ' (' + topic.id + ')'         : 'NOT FOUND — source_id will be null';
  const fmtSubject    = subject     ? subject.title + ' (' + subject.id + ')'     : 'NOT FOUND';
  const fmtConcept    = mainConcept ? mainConcept.name + ' (' + mainConcept.id + ')' : 'NOT FOUND';
  const fmtRoadmap    = roadmap     ? roadmap.title + ' (' + roadmap.id + ')'     : 'NOT FOUND';

  console.log('Source IDs resolved:');
  console.log('  topic        : ' + fmtTopic);
  console.log('  subject      : ' + fmtSubject);
  console.log('  main_concept : ' + fmtConcept);
  console.log('  roadmap      : ' + fmtRoadmap);
  console.log('');

  const sourceIds: Record<string, string | null> = {
    topic:        topic?.id ?? null,
    subject:      subject?.id ?? null,
    main_concept: mainConcept?.id ?? null,
    roadmap:      roadmap?.id ?? null,
    none:         null,
  };

  // ── 4. Create battles ─────────────────────────────────────────────────────
  const sourceTypes: string[] = ['topic', 'subject', 'main_concept', 'roadmap', 'none'];
  let created = 0;

  for (let i = 0; i < BATTLE_DEFS.length; i++) {
    const def = BATTLE_DEFS[i];
    const srcType = sourceTypes[i];
    const srcId = sourceIds[srcType];

    const battle = await prisma.battle.create({
      data: {
        title: def.title,
        description: def.description,
        type: def.type,
        status: def.status,
        difficulty: def.difficulty,
        user_id: creator.id,
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

    // Insert questions
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
    console.log(`    source_id: ${srcId ?? '(none)'}  questions: ${def.questions.length}  type: ${def.type}  difficulty: ${def.difficulty}\n`);
    created++;
  }

  console.log(`=== Done: ${created} battles created, all fully playable ===`);
}

main()
  .catch((err) => {
    console.error('Seeder failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
