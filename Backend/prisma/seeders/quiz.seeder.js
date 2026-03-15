"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const index_1 = require("../../resources/quizzes/index");
const prisma = new client_1.PrismaClient();
const seedQuizzes = async () => {
    try {
        for (const quizData of index_1.quizzes) {
            let topic = await prisma.topic.findFirst({
                where: { title: quizData.topicName },
            });
            if (!topic) {
                topic = await prisma.topic.create({
                    data: {
                        title: quizData.topicName,
                        description: quizData.topicName,
                        order: 0
                    }
                });
            }
            let quiz = await prisma.quiz.findFirst({
                where: { topic_id: topic.id },
            });
            if (!quiz) {
                quiz = await prisma.quiz.create({
                    data: {
                        topic_id: topic.id,
                        passing_score: quizData.passingMarks,
                    },
                });
            }
            for (const questionData of quizData.questions) {
                let question = await prisma.quizQuestion.findFirst({
                    where: { quiz_id: quiz.id, question: questionData.question }
                });
                if (!question) {
                    question = await prisma.quizQuestion.create({
                        data: {
                            quiz_id: quiz.id,
                            question: questionData.question,
                        },
                    });
                }
                for (const option of questionData.options) {
                    const existingOpt = await prisma.quizOption.findFirst({
                        where: { quiz_question_id: question.id, answer_text: option.answerText }
                    });
                    if (!existingOpt) {
                        await prisma.quizOption.create({
                            data: {
                                quiz_question_id: question.id,
                                answer_text: option.answerText,
                                is_correct: option.isCorrect,
                            },
                        });
                    }
                }
            }
        }
        console.log('Quizzes seeded or updated successfully!');
    }
    catch (error) {
        console.error('Error seeding quizzes:', error);
    }
    finally {
        await prisma.$disconnect();
    }
};
seedQuizzes();
//# sourceMappingURL=quiz.seeder.js.map