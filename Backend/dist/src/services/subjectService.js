"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubject = createSubject;
exports.getSubjects = getSubjects;
exports.getSubjectById = getSubjectById;
exports.updateSubject = updateSubject;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// create a subject
async function createSubject(data) {
    return await prisma.subject.create({
        data,
    });
}
// get all subjects
async function getSubjects() {
    return await prisma.subject.findMany();
}
// get a subject by id
async function getSubjectById(id) {
    return await prisma.subject.findUnique({
        where: {
            id,
        },
    });
}
// update a subject
async function updateSubject(id, data) {
    return await prisma.subject.update({
        where: {
            id,
        },
        data,
    });
}
//# sourceMappingURL=subjectService.js.map