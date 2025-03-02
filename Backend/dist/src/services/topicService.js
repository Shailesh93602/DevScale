"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTopic = createTopic;
exports.getTopics = getTopics;
exports.getTopicById = getTopicById;
exports.updateTopic = updateTopic;
exports.getTopicsBySubjectId = getTopicsBySubjectId;
exports.deleteTopic = deleteTopic;
exports.getTopicsWithoutSubject = getTopicsWithoutSubject;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createTopic(data) {
    return await prisma.topic.create({
        data,
    });
}
async function getTopics() {
    return await prisma.topic.findMany();
}
async function getTopicById(id) {
    return await prisma.topic.findUnique({
        where: {
            id,
        },
    });
}
async function updateTopic(id, data) {
    return await prisma.topic.update({
        where: {
            id,
        },
        data,
    });
}
// get topics by subject id
async function getTopicsBySubjectId(subject_id) {
    return await prisma.subjectTopic.findMany({
        where: {
            subject_id,
        },
        select: {
            id: true,
            order: true,
            created_at: true,
            subject_id: true,
            topic_id: true,
            topic: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                },
            },
        },
    });
}
async function deleteTopic(id) {
    await prisma.topic.delete({
        where: {
            id,
        },
    });
}
// get all topics that are not associated with any subject
async function getTopicsWithoutSubject() {
    return await prisma.topic.findMany({
        where: {
            subjects: {
                none: {},
            },
        },
    });
}
//# sourceMappingURL=topicService.js.map