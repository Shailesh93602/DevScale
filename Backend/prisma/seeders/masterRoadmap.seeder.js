"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
const ADMIN_EMAIL = 'admin@eduscale.io';
const CONTENT_DIR = path.join(__dirname, '../../resources/roadmapContent');
// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Read and parse a JSON file. Returns null if the file doesn't exist. */
function readJSON(filePath) {
    if (!fs.existsSync(filePath))
        return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
/** Read an HTML/text file. Returns empty string if it doesn't exist. */
function readText(filePath) {
    if (!fs.existsSync(filePath))
        return '';
    return fs.readFileSync(filePath, 'utf-8');
}
/** Get ordered subdirectories (sorted by numeric prefix: 1-foo, 2-bar …) */
function getOrderedDirs(parentPath) {
    if (!fs.existsSync(parentPath))
        return [];
    return fs
        .readdirSync(parentPath)
        .filter((name) => {
        const fullPath = path.join(parentPath, name);
        return fs.statSync(fullPath).isDirectory();
    })
        .sort((a, b) => {
        const numA = parseInt(a.split('-')[0], 10);
        const numB = parseInt(b.split('-')[0], 10);
        return numA - numB;
    });
}
// ─── Main Seeder ──────────────────────────────────────────────────────────────
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting Folder-Based Master Roadmap Seeder...');
        // Find admin user
        const user = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });
        if (!user)
            throw new Error(`Admin user not found: ${ADMIN_EMAIL}`);
        console.log(`✅ Admin user found: ${user.email}`);
        // ── Cleanup ──────────────────────────────────────────────────────────
        // REMOVED: Truncate logic removed as per user request to use upsert instead.
        console.log('\n🧹 Skipping cleanup, using upsert logic...');
        // ── Seed RoadmapCategories ────────────────────────────────────────────
        const categoryNames = [
            'Frontend', 'Backend', 'FullStack', 'Node', 'React',
            'Python', 'MachineLearning', 'DataAnalysis', 'DevOps',
            'Mobile', 'Cloud', 'DataEngineering', 'AI',
        ];
        const categoriesMap = new Map();
        for (const cat of categoryNames) {
            const dbCat = await prisma.roadmapCategory.upsert({
                where: { name: cat },
                update: {},
                create: { name: cat },
            });
            categoriesMap.set(cat, dbCat.id);
        }
        console.log(`✅ ${categoryNames.length} categories created.`);
        // ── Walk Roadmap Directories ──────────────────────────────────────────
        const roadmapDirs = getOrderedDirs(CONTENT_DIR);
        console.log(`\n📂 Found ${roadmapDirs.length} roadmap(s): ${roadmapDirs.join(', ')}\n`);
        for (const [rmIdx, rmDir] of roadmapDirs.entries()) {
            const rmPath = path.join(CONTENT_DIR, rmDir);
            const rmMeta = readJSON(path.join(rmPath, 'meta.json'));
            if (!rmMeta) {
                console.warn(`⚠️  Skipping ${rmDir} — missing meta.json`);
                continue;
            }
            // Pick the best matching category
            const tagList = rmMeta.tags.split(',').map((t) => t.trim());
            const matchedCat = tagList.find((t) => categoriesMap.has(t)) ?? categoryNames[0];
            const categoryId = categoriesMap.get(matchedCat) ?? categoriesMap.get(categoryNames[0]);
            const difficultyValue = (() => {
                const diff = (rmMeta.difficulty || '').toUpperCase();
                if (diff === 'INTERMEDIATE')
                    return client_1.Difficulty.MEDIUM;
                if (Object.values(client_1.Difficulty).includes(diff))
                    return diff;
                return client_1.Difficulty.EASY;
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
                    user_id: user.id,
                    tags: rmMeta.tags,
                    category_id: categoryId,
                    is_public: true,
                    popularity: 300 + rmIdx * 10,
                    difficulty: difficultyValue,
                },
            });
            console.log(`🗺️  [${rmIdx + 1}] Roadmap: "${roadmap.title}" (${roadmap.id})`);
            // ── Main Concepts ─────────────────────────────────────────────────
            const mcDirs = getOrderedDirs(rmPath);
            for (const [mcIdx, mcDir] of mcDirs.entries()) {
                const mcPath = path.join(rmPath, mcDir);
                const mcMeta = readJSON(path.join(mcPath, 'meta.json'));
                if (!mcMeta) {
                    console.warn(`  ⚠️  Skipping MainConcept ${mcDir} — missing meta.json`);
                    continue;
                }
                const mcName = mcMeta.name || mcMeta.title || '';
                const uniqueMcName = `${roadmap.id.substring(0, 5)}_${mcName}`;
                const mainConcept = await prisma.mainConcept.upsert({
                    where: { name: uniqueMcName },
                    update: { description: mcMeta.description, order: mcIdx + 1 },
                    create: { name: uniqueMcName, description: mcMeta.description, order: mcIdx + 1 },
                });
                await prisma.roadmapMainConcept.upsert({
                    where: { roadmap_id_main_concept_id: { roadmap_id: roadmap.id, main_concept_id: mainConcept.id } },
                    update: { order: mcIdx + 1 },
                    create: { roadmap_id: roadmap.id, main_concept_id: mainConcept.id, order: mcIdx + 1 },
                });
                console.log(`  📌 MainConcept [${mcIdx + 1}]: "${mcName}"`);
                // ── Subjects ──────────────────────────────────────────────────
                const subjectDirs = getOrderedDirs(mcPath);
                for (const [sIdx, sDir] of subjectDirs.entries()) {
                    const sPath = path.join(mcPath, sDir);
                    const sMeta = readJSON(path.join(sPath, 'meta.json'));
                    if (!sMeta) {
                        console.warn(`    ⚠️  Skipping Subject ${sDir} — missing meta.json`);
                        continue;
                    }
                    const sTitle = sMeta.name || sMeta.title || '';
                    const uniqueSubjectTitle = `${roadmap.id.substring(0, 5)}_${sTitle}`;
                    const subject = await prisma.subject.upsert({
                        where: { title: uniqueSubjectTitle },
                        update: { description: sMeta.description, order: sIdx + 1 },
                        create: { title: uniqueSubjectTitle, description: sMeta.description, order: sIdx + 1 },
                    });
                    await prisma.mainConceptSubject.upsert({
                        where: { main_concept_id_subject_id: { main_concept_id: mainConcept.id, subject_id: subject.id } },
                        update: { order: sIdx + 1 },
                        create: { main_concept_id: mainConcept.id, subject_id: subject.id, order: sIdx + 1 },
                    });
                    console.log(`    📚 Subject [${sIdx + 1}]: "${sTitle}"`);
                    // ── Topics ────────────────────────────────────────────────
                    const topicDirs = getOrderedDirs(sPath);
                    for (const [tIdx, tDir] of topicDirs.entries()) {
                        const tPath = path.join(sPath, tDir);
                        const tMeta = readJSON(path.join(tPath, 'meta.json'));
                        if (!tMeta) {
                            console.warn(`      ⚠️  Skipping Topic ${tDir} — missing meta.json`);
                            continue;
                        }
                        const tTitle = tMeta.name || tMeta.title || '';
                        let topic = await prisma.topic.findFirst({
                            where: { title: tTitle, description: tMeta.description },
                        });
                        if (topic) {
                            topic = await prisma.topic.update({
                                where: { id: topic.id },
                                data: { order: tIdx + 1 },
                            });
                        }
                        else {
                            topic = await prisma.topic.create({
                                data: { title: tTitle, description: tMeta.description, order: tIdx + 1 },
                            });
                        }
                        await prisma.subjectTopic.upsert({
                            where: { subject_id_topic_id: { subject_id: subject.id, topic_id: topic.id } },
                            update: { order: tIdx + 1 },
                            create: { subject_id: subject.id, topic_id: topic.id, order: tIdx + 1 },
                        });
                        await prisma.roadmapTopic.upsert({
                            where: { roadmap_id_topic_id: { roadmap_id: roadmap.id, topic_id: topic.id } },
                            update: { order: tIdx + 1 },
                            create: { roadmap_id: roadmap.id, topic_id: topic.id, order: tIdx + 1 },
                        });
                        console.log(`      📝 Topic [${tIdx + 1}]: "${tTitle}"`);
                        // ── Article ───────────────────────────────────────────
                        const articlePath = path.join(tPath, 'article.html');
                        const articleContent = readText(articlePath);
                        if (articleContent) {
                            const tTitle = tMeta.name || tMeta.title || '';
                            const existingArticle = await prisma.article.findFirst({
                                where: { topic_id: topic.id, title: tTitle },
                            });
                            if (existingArticle) {
                                await prisma.article.update({
                                    where: { id: existingArticle.id },
                                    data: { content: articleContent, status: client_1.Status.APPROVED },
                                });
                            }
                            else {
                                const tTitle = tMeta.name || tMeta.title || '';
                                await prisma.article.create({
                                    data: {
                                        title: tTitle,
                                        content: articleContent,
                                        author_id: user.id,
                                        topic_id: topic.id,
                                        status: client_1.Status.APPROVED,
                                    },
                                });
                            }
                        }
                        // ── Quiz ──────────────────────────────────────────────
                        const quizData = readJSON(path.join(tPath, 'quiz.json'));
                        if (quizData) {
                            const qTitle = quizData.title || `${tTitle} Quiz`;
                            const qDesc = quizData.description || `Test your knowledge on ${tTitle}`;
                            const qTime = quizData.timeLimit || 15;
                            const qScore = quizData.passingScore || 70;
                            let quiz = await prisma.quiz.findFirst({
                                where: { topic_id: topic.id, title: qTitle },
                            });
                            if (quiz) {
                                quiz = await prisma.quiz.update({
                                    where: { id: quiz.id },
                                    data: {
                                        description: qDesc,
                                        time_limit: qTime,
                                        passing_score: qScore,
                                    },
                                });
                                // Clear existing questions and options for this quiz to avoid duplicates
                                const existingQuestionIds = (await prisma.question.findMany({
                                    where: { quiz_id: quiz.id },
                                    select: { id: true }
                                })).map(q => q.id);
                                await prisma.option.deleteMany({
                                    where: { question_id: { in: existingQuestionIds } }
                                });
                                await prisma.question.deleteMany({ where: { quiz_id: quiz.id } });
                            }
                            else {
                                quiz = await prisma.quiz.create({
                                    data: {
                                        title: qTitle,
                                        description: qDesc,
                                        type: client_1.QuizType.multiple_choice,
                                        time_limit: qTime,
                                        passing_score: qScore,
                                        topic_id: topic.id,
                                    },
                                });
                            }
                            for (const q of quizData.questions) {
                                let optionsData = [];
                                if (q.options && q.options.length > 0) {
                                    if (typeof q.options[0] === 'object') {
                                        // Format A: { text: string, isCorrect: boolean }[]
                                        optionsData = q.options.map((opt) => {
                                            // Handle typos like "is   Correct" found in some files
                                            const isCorrect = opt.isCorrect === true ||
                                                opt.is_correct === true ||
                                                opt["is   Correct"] === true ||
                                                Boolean(opt.correct);
                                            return {
                                                text: opt.text || 'N/A',
                                                isCorrect: isCorrect,
                                            };
                                        });
                                    }
                                    else {
                                        // Format B: string[] with correctAnswer index
                                        optionsData = q.options.map((opt, idx) => ({
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
                    }
                }
            }
            console.log(`\n✅ Roadmap "${roadmap.title}" seeded successfully!\n`);
        }
        console.log('🎉 All roadmaps seeded successfully!');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
};
seedDatabase();
//# sourceMappingURL=masterRoadmap.seeder.js.map