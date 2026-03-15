"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const index_1 = require("../../resources/challenges/index");
const prisma = new client_1.PrismaClient();
function mapDifficulty(d) {
    const map = { Easy: client_1.Difficulty.EASY, Medium: client_1.Difficulty.MEDIUM, Hard: client_1.Difficulty.HARD };
    return map[d] ?? client_1.Difficulty.EASY;
}
function mapCategory(c) {
    const valid = Object.values(client_1.ChallengeCategory);
    return valid.includes(c) ? c : client_1.ChallengeCategory.algorithms;
}
function calcPoints(difficulty, base = 0) {
    if (base > 0)
        return base;
    return difficulty === 'Easy' ? 50 : difficulty === 'Medium' ? 100 : 200;
}
const seedChallenges = async () => {
    try {
        console.log(`🌱 Starting Master Challenge Seeder — ${index_1.allChallenges.length} challenges...\n`);
        const allTopics = await prisma.topic.findMany({ select: { id: true, title: true } });
        const topicByTitle = new Map(allTopics.map((t) => [t.title.toLowerCase(), t.id]));
        let seeded = 0;
        let skipped = 0;
        for (const [idx, c] of index_1.allChallenges.entries()) {
            if (!c.title || !c.description) {
                skipped++;
                continue;
            }
            console.log(`Working on ${idx + 1}/${index_1.allChallenges.length}: ${c.title}...`);
            const topicId = c.tags?.map((t) => topicByTitle.get(t.toLowerCase())).find(Boolean) ?? null;
            const challenge = await prisma.challenge.upsert({
                where: { title: c.title },
                update: {
                    description: c.description,
                    difficulty: mapDifficulty(c.difficulty),
                    category: mapCategory(c.category),
                    points: calcPoints(c.difficulty, c.points),
                    tags: c.tags ?? [],
                    company_tags: c.company_tags ?? [],
                    hints: c.hints ?? [],
                    editorial: c.editorial ?? null,
                    input_format: c.input_format,
                    output_format: c.output_format,
                    example_input: c.example_input,
                    example_output: c.example_output,
                    constraints: c.constraints,
                    function_signature: c.function_signature,
                    time_limit: c.time_limit_ms ?? 2000,
                    memory_limit: c.memory_limit_kb ?? 262144,
                    solutions: c.solution ? { typescript: c.solution } : undefined,
                    status: client_1.ChallengeStatus.ACTIVE,
                    ...(topicId ? { topic_id: topicId } : {}),
                },
                create: {
                    title: c.title,
                    description: c.description,
                    difficulty: mapDifficulty(c.difficulty),
                    category: mapCategory(c.category),
                    points: calcPoints(c.difficulty, c.points),
                    tags: c.tags ?? [],
                    company_tags: c.company_tags ?? [],
                    hints: c.hints ?? [],
                    editorial: c.editorial ?? null,
                    input_format: c.input_format,
                    output_format: c.output_format,
                    example_input: c.example_input,
                    example_output: c.example_output,
                    constraints: c.constraints,
                    function_signature: c.function_signature,
                    time_limit: c.time_limit_ms ?? 2000,
                    memory_limit: c.memory_limit_kb ?? 262144,
                    solutions: c.solution ? { typescript: c.solution } : undefined,
                    status: client_1.ChallengeStatus.ACTIVE,
                    ...(topicId ? { topic_id: topicId } : {}),
                },
            });
            if (c.test_cases && c.test_cases.length > 0) {
                await prisma.testCase.deleteMany({ where: { challenge_id: challenge.id } });
                await prisma.testCase.createMany({
                    data: c.test_cases.map((tc, i) => ({
                        challenge_id: challenge.id,
                        input: tc.input,
                        output: tc.expected_output,
                        is_hidden: tc.is_hidden ?? i >= 2,
                    })),
                });
            }
            seeded++;
            if ((idx + 1) % 50 === 0)
                console.log(`  ✅ ${idx + 1} / ${index_1.allChallenges.length} seeded...`);
        }
        console.log(`\n🎉 Done! Seeded: ${seeded} | Skipped: ${skipped}`);
    }
    catch (err) {
        console.error('❌ Error seeding challenges:', err);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
};
seedChallenges();
//# sourceMappingURL=masterChallenge.seeder.js.map