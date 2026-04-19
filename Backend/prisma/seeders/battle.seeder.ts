import { PrismaClient, BattleType, BattleStatus, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();
const admin = 'admin@eduscale.io';

const seedBattles = async () => {
    try {
        console.log('Seeding battles...');
        const user = await prisma.user.findFirst({
            where: { email: admin },
        });

        if (!user) {
            console.error('❌ Admin user not found. Please run user seeder first.');
            return;
        }

        const topic = await prisma.topic.findFirst();

        if (!topic) {
            console.error('❌ Could not find any topic. Please run topic/roadmap seeder first.');
            return;
        }

        const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];
        // Note: length/difficulty mapping is seed-only; if you revive this,
        // it'd be [Length.short, Difficulty.MEDIUM, Length.long].
        const types = [BattleType.QUICK, BattleType.SCHEDULED, BattleType.PRACTICE];
        const titles = [
            'JavaScript Fundamentals Duel',
            'React Masters Tournament',
            'Data Structures Sprint',
            'Python Data Analysis',
            'Node.js Backend Clash',
            'System Design Showdown',
            'Big O Notation Quiz',
            'CSS Grid & Flexbox Battle',
            'SQL Query Race',
            'TypeScript Compilation Check',
            'Next.js Routing Challenge',
            'Web Security Best Practices',
            'Docker & Containers Brawl',
            'Kubernetes Deployment Race',
            'Machine Learning Intro Course'
        ];

        for (let i = 0; i < titles.length; i++) {
            const title = titles[i];
            const existing = await prisma.battle.findFirst({ where: { title } });
            if (existing) continue;

            const battle = await prisma.battle.create({
                data: {
                    title,
                    description: `A challenging battle regarding ${title}. Prove your skills!`,
                    type: types[i % types.length],
                    status: BattleStatus.WAITING,
                    difficulty: difficulties[i % difficulties.length],
                    max_participants: (i % 3 === 0) ? 16 : 2,
                    total_questions: 10 + (i % 5) * 5,
                    points_per_question: 10,
                    time_per_question: 30,
                    user_id: user.id,
                    topic_id: topic.id,
                }
            });

            // Add dummy questions
            for (let q = 1; q <= 3; q++) {
                await prisma.battleQuestion.create({
                    data: {
                        battle_id: battle.id,
                        question: `Sample Question ${q} for ${title}?`,
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correct_answer: 0,
                        order: q
                    }
                });
            }
        }

        console.log('Battles seeded successfully');
    } catch (error) {
        console.error('Error seeding battles:', error);
    } finally {
        await prisma.$disconnect();
    }
};

seedBattles();
