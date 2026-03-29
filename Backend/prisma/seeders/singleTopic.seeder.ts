import { PrismaClient, Status, QuizType } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** 
 * Targeted Topic Seeder
 * Use this to seed content for a specific existing topic.
 * 
 * Usage: npx tsx prisma/seeders/singleTopic.seeder.ts "Topic Title" "../../path/to/content/folder"
 */

async function seedSingleTopic() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('❌ Usage: npx tsx prisma/seeders/singleTopic.seeder.ts "Topic Title" "path/to/content/folder"');
    process.exit(1);
  }

  const [topicTitle, contentPathArg] = args;
  const contentPath = path.isAbsolute(contentPathArg) 
    ? contentPathArg 
    : path.join(process.cwd(), contentPathArg);

  try {
    console.log(`🔍 Searching for topic: "${topicTitle}"...`);
    let topic = await prisma.topic.findFirst({
      where: { title: topicTitle }
    });

    if (!topic) {
        console.warn(`⚠️ Topic not found. Creating a new topic with title: "${topicTitle}"`);
        topic = await prisma.topic.create({
            data: {
              title: topicTitle,
              description: topicTitle,
              order: 999
            }
        });
    }

    const admin = await prisma.user.findFirst({ where: { email: 'admin@eduscale.io' } });
    const authorId = admin?.id || (await prisma.user.findFirst())?.id;

    if (!authorId) throw new Error('No user found to assign as author');

    // 1. Process Article
    const articlePath = path.join(contentPath, 'article.html');
    if (fs.existsSync(articlePath)) {
        const content = fs.readFileSync(articlePath, 'utf8');
        const existingArticle = await prisma.article.findFirst({
            where: { topic_id: topic.id, title: topicTitle }
        });

        if (existingArticle) {
            await prisma.article.update({
                where: { id: existingArticle.id },
                data: { content, status: Status.APPROVED }
            });
            console.log(`✅ Article updated for "${topicTitle}"`);
        } else {
            await prisma.article.create({
                data: {
                    title: topicTitle,
                    content,
                    author_id: authorId,
                    topic_id: topic.id,
                    status: Status.APPROVED
                }
            });
            console.log(`✅ Article created for "${topicTitle}"`);
        }
    } else {
        console.warn(`ℹ️ No article.html found in ${contentPath}`);
    }

    // 2. Process Quiz
    const quizPath = path.join(contentPath, 'quiz.json');
    if (fs.existsSync(quizPath)) {
        const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
        const qTitle = quizData.title || `${topicTitle} Quiz`;
        
        let quiz = await prisma.quiz.findFirst({
            where: { topic_id: topic.id, title: qTitle }
        });

        if (quiz) {
            await prisma.option.deleteMany({ where: { question: { quiz_id: quiz.id } } });
            await prisma.question.deleteMany({ where: { quiz_id: quiz.id } });
            await prisma.quiz.update({
                where: { id: quiz.id },
                data: { passing_score: quizData.passingScore || 70 }
            });
        } else {
            quiz = await prisma.quiz.create({
                data: {
                    title: qTitle,
                    description: quizData.description || `Test your knowledge on ${topicTitle}`,
                    type: QuizType.multiple_choice,
                    topic_id: topic.id,
                    passing_score: quizData.passingScore || 70
                }
            });
        }

        for (const q of quizData.questions) {
            const question = await prisma.question.create({
                data: {
                    quiz_id: quiz.id,
                    question: q.question,
                    type: 'MULTIPLE_CHOICE',
                    points: q.points || 10,
                    correct_answer: (typeof q.options?.[q.correctAnswer] === 'string') 
                        ? q.options[q.correctAnswer] 
                        : (q.options?.[q.correctAnswer]?.text || 'N/A')
                }
            });

            if (q.options) {
                await prisma.option.createMany({
                    data: q.options.map((opt: any, idx: number) => ({
                        question_id: question.id,
                        text: typeof opt === 'string' ? opt : opt.text,
                        is_correct: idx === q.correctAnswer || !!opt.isCorrect
                    }))
                });
            }
        }
        console.log(`✅ Quiz seeded for "${topicTitle}"`);
    }

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSingleTopic();
