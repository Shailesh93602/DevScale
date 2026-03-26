import { PrismaClient, Difficulty, QuizType, Status } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

const CONTENT_DIR = path.join(process.cwd(), 'resources', 'roadmaps');
const ADMIN_EMAIL = 'shailesh93602@gmail.com';

// ── Types ──────────────────────────────────────────────────────────────────
interface RoadmapMeta {
  title: string;
  description: string;
  difficulty: string;
  tags: string;
}

interface MainConceptMeta {
  name?: string;
  title?: string;
  description: string;
}

interface SubjectMeta {
  name?: string;
  title?: string;
  description: string;
}

interface TopicMeta {
  name?: string;
  title?: string;
  description: string;
}

interface QuizData {
  title?: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: unknown[];
  correctAnswer?: number;
  points?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const readJSON = <T>(filePath: string): T | null => {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const readText = (filePath: string): string | null => {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
};

const getOrderedDirs = (basePath: string): string[] => {
  if (!fs.existsSync(basePath)) return [];
  return fs
    .readdirSync(basePath)
    .filter((file) => fs.statSync(path.join(basePath, file)).isDirectory())
    .sort((a, b) => {
      const aNum = Number.parseInt(a.split('_')[0]) || 0;
      const bNum = Number.parseInt(b.split('_')[0]) || 0;
      return aNum - bNum;
    });
};

const mapDifficulty = (d: string): Difficulty => {
  const diff = (d || '').toUpperCase();
  if (diff === 'INTERMEDIATE') return Difficulty.MEDIUM;
  if (Object.values(Difficulty).includes(diff as Difficulty)) return diff as Difficulty;
  return Difficulty.EASY;
};

// ── Secondary Seeders ─────────────────────────────────────────────────────

async function processQuiz(tPath: string, topicId: string, topicTitle: string) {
  const quizData = readJSON<QuizData>(path.join(tPath, 'quiz.json'));
  if (!quizData) return;

  const qTitle = quizData.title || `${topicTitle} Quiz`;
  const qDesc = quizData.description || `Test your knowledge on ${topicTitle}`;
  const qTime = quizData.timeLimit || 15;
  const qScore = quizData.passingScore || 70;

  let quiz = await prisma.quiz.findFirst({ where: { topic_id: topicId, title: qTitle } });

  if (quiz) {
    quiz = await prisma.quiz.update({
      where: { id: quiz.id },
      data: { description: qDesc, time_limit: qTime, passing_score: qScore },
    });
    const questionIds = (await prisma.question.findMany({ where: { quiz_id: quiz.id }, select: { id: true } })).map((q) => q.id);
    await prisma.option.deleteMany({ where: { question_id: { in: questionIds } } });
    await prisma.question.deleteMany({ where: { quiz_id: quiz.id } });
  } else {
    quiz = await prisma.quiz.create({
      data: { title: qTitle, description: qDesc, type: QuizType.multiple_choice, time_limit: qTime, passing_score: qScore, topic_id: topicId },
    });
  }

  for (const q of quizData.questions) {
    let optionsData: { text: string; isCorrect: boolean }[] = [];
    if (q.options && q.options.length > 0) {
      if (typeof q.options[0] === 'object') {
        optionsData = (q.options as { text: string; isCorrect?: boolean; is_correct?: boolean; correct?: boolean; 'is   Correct'?: boolean }[]).map((opt) => {
          const isCorrect = opt.isCorrect === true || opt.is_correct === true || opt['is   Correct'] === true || Boolean(opt.correct);
          return { text: opt.text || 'N/A', isCorrect };
        });
      } else {
        optionsData = (q.options as string[]).map((opt, idx) => ({ text: opt, isCorrect: idx === q.correctAnswer }));
      }
    }

    const correctOpt = optionsData.find((o) => o.isCorrect);
    const question = await prisma.question.create({
      data: {
        quiz_id: quiz.id,
        question: q.question,
        type: 'MULTIPLE_CHOICE',
        correct_answer: correctOpt?.text ?? (optionsData[0]?.text || 'N/A'),
        points: q.points ?? 10,
      },
    });

    if (optionsData.length > 0) {
      await prisma.option.createMany({
        data: optionsData.map((opt) => ({ question_id: question.id, text: opt.text, is_correct: opt.isCorrect })),
      });
    }
  }
}

async function processArticle(tPath: string, topicId: string, topicTitle: string, userId: string) {
  const articleContent = readText(path.join(tPath, 'article.html'));
  if (!articleContent) return;

  const existingArticle = await prisma.article.findFirst({ where: { topic_id: topicId, title: topicTitle } });
  if (existingArticle) {
    await prisma.article.update({ where: { id: existingArticle.id }, data: { content: articleContent, status: Status.APPROVED } });
  } else {
    await prisma.article.create({
      data: { title: topicTitle, content: articleContent, author_id: userId, topic_id: topicId, status: Status.APPROVED },
    });
  }
}

async function processTopic(tPath: string, tDir: string, tIdx: number, subjectId: string, roadmapId: string, userId: string) {
  const tMeta = readJSON<TopicMeta>(path.join(tPath, 'meta.json'));
  if (!tMeta) { console.warn(`      ⚠️ Skipping Topic ${tDir} — missing meta.json`); return; }

  const tTitle = tMeta.name || tMeta.title || '';
  let topic = await prisma.topic.findFirst({ where: { title: tTitle, description: tMeta.description } });

  if (topic) {
    topic = await prisma.topic.update({ where: { id: topic.id }, data: { order: tIdx + 1 } });
  } else {
    topic = await prisma.topic.create({ data: { title: tTitle, description: tMeta.description, order: tIdx + 1 } });
  }

  await prisma.subjectTopic.upsert({
    where: { subject_id_topic_id: { subject_id: subjectId, topic_id: topic.id } },
    update: { order: tIdx + 1 },
    create: { subject_id: subjectId, topic_id: topic.id, order: tIdx + 1 },
  });

  await prisma.roadmapTopic.upsert({
    where: { roadmap_id_topic_id: { roadmap_id: roadmapId, topic_id: topic.id } },
    update: { order: tIdx + 1 },
    create: { roadmap_id: roadmapId, topic_id: topic.id, order: tIdx + 1 },
  });

  console.log(`      📝 Topic [${tIdx + 1}]: "${tTitle}"`);
  await processArticle(tPath, topic.id, tTitle, userId);
  await processQuiz(tPath, topic.id, tTitle);
}

async function processSubject(sPath: string, sDir: string, sIdx: number, mainConceptId: string, roadmapId: string, userId: string) {
  const sMeta = readJSON<SubjectMeta>(path.join(sPath, 'meta.json'));
  if (!sMeta) { console.warn(`    ⚠️ Skipping Subject ${sDir} — missing meta.json`); return; }

  const sTitle = sMeta.name || sMeta.title || '';
  const uniqueSubjectTitle = `${roadmapId.substring(0, 5)}_${sTitle}`;
  const subject = await prisma.subject.upsert({
    where: { title: uniqueSubjectTitle },
    update: { description: sMeta.description, order: sIdx + 1 },
    create: { title: uniqueSubjectTitle, description: sMeta.description, order: sIdx + 1 },
  });

  await prisma.mainConceptSubject.upsert({
    where: { main_concept_id_subject_id: { main_concept_id: mainConceptId, subject_id: subject.id } },
    update: { order: sIdx + 1 },
    create: { main_concept_id: mainConceptId, subject_id: subject.id, order: sIdx + 1 },
  });

  console.log(`    📚 Subject [${sIdx + 1}]: "${sTitle}"`);
  const topicDirs = getOrderedDirs(sPath);
  for (const [tIdx, tDir] of topicDirs.entries()) {
    await processTopic(path.join(sPath, tDir), tDir, tIdx, subject.id, roadmapId, userId);
  }
}

async function processMainConcept(mcPath: string, mcDir: string, mcIdx: number, roadmapId: string, userId: string) {
  const mcMeta = readJSON<MainConceptMeta>(path.join(mcPath, 'meta.json'));
  if (!mcMeta) { console.warn(`  ⚠️ Skipping MainConcept ${mcDir} — missing meta.json`); return; }

  const mcName = mcMeta.name || mcMeta.title || '';
  const uniqueMcName = `${roadmapId.substring(0, 5)}_${mcName}`;
  const mainConcept = await prisma.mainConcept.upsert({
    where: { name: uniqueMcName },
    update: { description: mcMeta.description, order: mcIdx + 1 },
    create: { name: uniqueMcName, description: mcMeta.description, order: mcIdx + 1 },
  });

  await prisma.roadmapMainConcept.upsert({
    where: { roadmap_id_main_concept_id: { roadmap_id: roadmapId, main_concept_id: mainConcept.id } },
    update: { order: mcIdx + 1 },
    create: { roadmap_id: roadmapId, main_concept_id: mainConcept.id, order: mcIdx + 1 },
  });

  console.log(`  📌 MainConcept [${mcIdx + 1}]: "${mcName}"`);
  const subjectDirs = getOrderedDirs(mcPath);
  for (const [sIdx, sDir] of subjectDirs.entries()) {
    await processSubject(path.join(mcPath, sDir), sDir, sIdx, mainConcept.id, roadmapId, userId);
  }
}

async function processRoadmap(rmPath: string, rmDir: string, rmIdx: number, userId: string, categoriesMap: Map<string, string>, categoryNames: string[]) {
  const rmMeta = readJSON<RoadmapMeta>(path.join(rmPath, 'meta.json'));
  if (!rmMeta) { console.warn(`⚠️ Skipping ${rmDir} — missing meta.json`); return; }

  const tagList = rmMeta.tags.split(',').map((t) => t.trim());
  const matchedCat = tagList.find((t) => categoriesMap.has(t)) ?? categoryNames[0];
  const categoryId = categoriesMap.get(matchedCat) ?? (categoriesMap.get(categoryNames[0]) || '');

  const roadmap = await prisma.roadmap.upsert({
    where: { title: rmMeta.title },
    update: { description: rmMeta.description, tags: rmMeta.tags, category_id: categoryId, popularity: 300 + rmIdx * 10, difficulty: mapDifficulty(rmMeta.difficulty) },
    create: { title: rmMeta.title, description: rmMeta.description, user_id: userId, tags: rmMeta.tags, category_id: categoryId, is_public: true, popularity: 300 + rmIdx * 10, difficulty: mapDifficulty(rmMeta.difficulty) },
  });

  console.log(`🗺️ [${rmIdx + 1}] Roadmap: "${roadmap.title}" (${roadmap.id})`);
  const mcDirs = getOrderedDirs(rmPath);
  for (const [mcIdx, mcDir] of mcDirs.entries()) {
    await processMainConcept(path.join(rmPath, mcDir), mcDir, mcIdx, roadmap.id, userId);
  }
  console.log(`\n✅ Roadmap "${roadmap.title}" seeded successfully!\n`);
}

// ── Main Controller ────────────────────────────────────────────────────────

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Folder-Based Master Roadmap Seeder...');
    const user = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });
    if (!user) throw new Error(`Admin user not found: ${ADMIN_EMAIL}`);

    const categoryNames = ['Frontend', 'Backend', 'FullStack', 'Node', 'React', 'Python', 'MachineLearning', 'DataAnalysis', 'DevOps', 'Mobile', 'Cloud', 'DataEngineering', 'AI'];
    const categoriesMap = new Map<string, string>();
    for (const cat of categoryNames) {
      const dbCat = await prisma.roadmapCategory.upsert({ where: { name: cat }, update: {}, create: { name: cat } });
      categoriesMap.set(cat, dbCat.id);
    }

    const roadmapDirs = getOrderedDirs(CONTENT_DIR);
    for (const [rmIdx, rmDir] of roadmapDirs.entries()) {
      await processRoadmap(path.join(CONTENT_DIR, rmDir), rmDir, rmIdx, user.id, categoriesMap, categoryNames);
    }

    console.log('🎉 All roadmaps seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
