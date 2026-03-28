import { PrismaClient, Difficulty, Status, QuizType } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();
const ADMIN_EMAIL = 'admin@eduscale.io';
const CONTENT_DIR = path.join(__dirname, '../../resources/roadmapContent');

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoadmapMeta {
  title: string;
  description: string;
  tags: string;
  difficulty?: string;
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

interface OptionObject {
  text?: string;
  isCorrect?: boolean;
  is_correct?: boolean;
  "is   Correct"?: boolean;
  correct?: boolean;
}

interface QuizQuestion {
  question: string;
  points?: number;
  options: (OptionObject | string)[];
  correctAnswer?: number;
}

interface QuizData {
  title?: string;
  description?: string;
  passingScore?: number;
  timeLimit?: number;
  questions: QuizQuestion[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Read and parse a JSON file. Returns null if the file doesn't exist. */
function readJSON<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

/** Read an HTML/text file. Returns empty string if it doesn't exist. */
function readText(filePath: string): string {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8');
}

/** Get ordered subdirectories (sorted by numeric prefix: 1-foo, 2-bar …) */
function getOrderedDirs(parentPath: string): string[] {
  if (!fs.existsSync(parentPath)) return [];
  return fs
    .readdirSync(parentPath)
    .filter((name) => {
      const fullPath = path.join(parentPath, name);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort((a, b) => {
      const numA = Number.parseInt(a.split('-')[0], 10);
      const numB = Number.parseInt(b.split('-')[0], 10);
      return numA - numB;
    });
}

// ─── Helpers: Seeding Logic ──────────────────────────────────────────────────

async function seedCategories() {
  const categoryNames = [
    'Frontend', 'Backend', 'FullStack', 'Node', 'React',
    'Python', 'MachineLearning', 'DataAnalysis', 'DevOps',
    'Mobile', 'Cloud', 'DataEngineering', 'AI',
  ];
  const categoriesMap = new Map<string, string>();
  for (const cat of categoryNames) {
    const dbCat = await prisma.roadmapCategory.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    });
    categoriesMap.set(cat, dbCat.id);
  }
  return { categoriesMap, categoryNames };
}

async function processQuiz(topicId: string, tPath: string, tTitle: string) {
  const quizData = readJSON<QuizData>(path.join(tPath, 'quiz.json'));
  if (!quizData) return;

  const qTitle = quizData.title || `${tTitle} Quiz`;
  const qDesc = quizData.description || `Test your knowledge on ${tTitle}`;
  const qTime = quizData.timeLimit || 15;
  const qScore = quizData.passingScore || 70;

  let quiz = await prisma.quiz.findFirst({
    where: { topic_id: topicId, title: qTitle },
  });

  if (quiz) {
    quiz = await prisma.quiz.update({
      where: { id: quiz.id },
      data: { description: qDesc, time_limit: qTime, passing_score: qScore },
    });
    const existingQuestionIds = (await prisma.question.findMany({
      where: { quiz_id: quiz.id },
      select: { id: true }
    })).map(q => q.id);

    await prisma.option.deleteMany({ where: { question_id: { in: existingQuestionIds } } });
    await prisma.question.deleteMany({ where: { quiz_id: quiz.id } });
  } else {
    quiz = await prisma.quiz.create({
      data: {
        title: qTitle,
        description: qDesc,
        type: QuizType.multiple_choice,
        time_limit: qTime,
        passing_score: qScore,
        topic_id: topicId,
      },
    });
  }

  for (const q of quizData.questions) {
    let optionsData: { text: string; isCorrect: boolean }[] = [];
    if (q.options?.length > 0) {
      if (typeof q.options[0] === 'object') {
        optionsData = (q.options as OptionObject[]).map((opt) => ({
          text: opt.text || 'N/A',
          isCorrect: !!(opt.isCorrect || opt.is_correct || opt["is   Correct"] || opt.correct),
        }));
      } else {
        optionsData = (q.options as string[]).map((opt, idx) => ({
          text: opt,
          isCorrect: idx === q.correctAnswer,
        }));
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
        data: optionsData.map((opt) => ({
          question_id: question.id,
          text: opt.text,
          is_correct: opt.isCorrect,
        })),
      });
    }
  }
}

async function processArticle(topicId: string, tPath: string, tTitle: string, userId: string) {
  const articlePath = path.join(tPath, 'article.html');
  const articleContent = readText(articlePath);
  if (!articleContent) return;

  const existingArticle = await prisma.article.findFirst({
    where: { topic_id: topicId, title: tTitle },
  });

  if (existingArticle) {
    await prisma.article.update({
      where: { id: existingArticle.id },
      data: { content: articleContent, status: Status.APPROVED },
    });
  } else {
    await prisma.article.create({
      data: {
        title: tTitle,
        content: articleContent,
        author_id: userId,
        topic_id: topicId,
        status: Status.APPROVED,
      },
    });
  }
}

async function processTopic(subjectId: string, roadmapId: string, tPath: string, tDir: string, tIdx: number, userId: string) {
  const tMeta = readJSON<TopicMeta>(path.join(tPath, 'meta.json'));
  if (!tMeta) return;

  const tTitle = tMeta.name || tMeta.title || '';
  let topic = await prisma.topic.findFirst({
    where: { title: tTitle, description: tMeta.description },
  });

  if (topic) {
    topic = await prisma.topic.update({
      where: { id: topic.id },
      data: { order: tIdx + 1 },
    });
  } else {
    topic = await prisma.topic.create({
      data: { title: tTitle, description: tMeta.description, order: tIdx + 1 },
    });
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
  await processArticle(topic.id, tPath, tTitle, userId);
  await processQuiz(topic.id, tPath, tTitle);
}

async function processSubject(mainConceptId: string, roadmapId: string, sPath: string, sDir: string, sIdx: number, userId: string) {
  const sMeta = readJSON<SubjectMeta>(path.join(sPath, 'meta.json'));
  if (!sMeta) return;

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
    await processTopic(subject.id, roadmapId, path.join(sPath, tDir), tDir, tIdx, userId);
  }
}

async function processMainConcept(roadmapId: string, mcPath: string, mcDir: string, mcIdx: number, userId: string) {
  const mcMeta = readJSON<MainConceptMeta>(path.join(mcPath, 'meta.json'));
  if (!mcMeta) return;

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
    await processSubject(mainConcept.id, roadmapId, path.join(mcPath, sDir), sDir, sIdx, userId);
  }
}

async function processRoadmap(rmPath: string, rmDir: string, rmIdx: number, categoriesMap: Map<string, string>, categoryNames: string[], userId: string) {
  const rmMeta = readJSON<RoadmapMeta>(path.join(rmPath, 'meta.json'));
  if (!rmMeta) {
    console.warn(`⚠️  Skipping ${rmDir} — missing meta.json`);
    return;
  }

  const tagList = rmMeta.tags.split(',').map((t) => t.trim());
  const matchedCat = tagList.find((t) => categoriesMap.has(t)) ?? categoryNames[0];
  const categoryId = categoriesMap.get(matchedCat) ?? categoriesMap.get(categoryNames[0])!;

  const difficultyValue = (() => {
    const diff = (rmMeta.difficulty || '').toUpperCase();
    if (diff === 'INTERMEDIATE') return Difficulty.MEDIUM;
    if (Object.values(Difficulty).includes(diff as Difficulty)) return diff as Difficulty;
    return Difficulty.EASY;
  })();

  const roadmap = await prisma.roadmap.upsert({
    where: { title: rmMeta.title },
    update: {
      description: rmMeta.description,
      tags: rmMeta.tags,
      category_id: categoryId,
      popularity: 300 + rmIdx * 10,
      difficulty: difficultyValue,
    },
    create: {
      title: rmMeta.title,
      description: rmMeta.description,
      user_id: userId,
      tags: rmMeta.tags,
      category_id: categoryId,
      is_public: true,
      popularity: 300 + rmIdx * 10,
      difficulty: difficultyValue,
    },
  });

  console.log(`🗺️  [${rmIdx + 1}] Roadmap: "${roadmap.title}" (${roadmap.id})`);
  const mcDirs = getOrderedDirs(rmPath);
  for (const [mcIdx, mcDir] of mcDirs.entries()) {
    await processMainConcept(roadmap.id, path.join(rmPath, mcDir), mcDir, mcIdx, userId);
  }
}

// ─── Main Seeder ──────────────────────────────────────────────────────────────

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Folder-Based Master Roadmap Seeder...');

    const user = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });
    if (!user) throw new Error(`Admin user not found: ${ADMIN_EMAIL}`);
    console.log(`✅ Admin user found: ${user.email}`);

    console.log('\n🧹 Skipping cleanup, using upsert logic...');

    const { categoriesMap, categoryNames } = await seedCategories();
    console.log(`✅ ${categoryNames.length} categories processed.`);

    const roadmapDirs = getOrderedDirs(CONTENT_DIR);
    console.log(`\n📂 Found ${roadmapDirs.length} roadmap(s): ${roadmapDirs.join(', ')}\n`);

    for (const [rmIdx, rmDir] of roadmapDirs.entries()) {
      await processRoadmap(path.join(CONTENT_DIR, rmDir), rmDir, rmIdx, categoriesMap, categoryNames, user.id);
      console.log(`\n✅ Roadmap "${rmDir}" seeded successfully!\n`);
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
