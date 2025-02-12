"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudyGroupMemberRole = exports.removeStudyGroupMember = exports.updateStudyGroup = exports.getStudyGroup = exports.getStudyGroups = exports.joinStudyGroup = exports.createStudyGroup = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new client_1.PrismaClient();
const createStudyGroup = async (data) => {
    try {
        return await prisma.studyGroup.create({
            data: {
                ...data,
                members: {
                    create: {
                        userId: data.createdBy,
                        role: client_1.GroupRole.admin,
                    },
                },
            },
            include: { topic: true, members: true },
        });
    }
    catch (error) {
        throw (0, errorHandler_1.createAppError)('Failed to create study group', 500, error);
    }
};
exports.createStudyGroup = createStudyGroup;
const joinStudyGroup = async (groupId, userId, role = client_1.GroupRole.member) => {
    const group = await prisma.studyGroup.findUnique({
        where: { id: groupId },
        include: { _count: { select: { members: true } } },
    });
    if (!group)
        throw (0, errorHandler_1.createAppError)('Study group not found', 404);
    if (group.maxMembers && group._count.members >= group.maxMembers) {
        throw (0, errorHandler_1.createAppError)('Study group is full', 400);
    }
    await prisma.studyGroupMember.create({
        data: { userId, studyGroupId: groupId, role },
    });
};
exports.joinStudyGroup = joinStudyGroup;
const getStudyGroups = async (filters) => {
    return prisma.studyGroup.findMany({
        where: {
            topicId: filters?.topicId,
            name: filters?.search
                ? { contains: filters.search, mode: 'insensitive' }
                : undefined,
        },
        include: { topic: true, _count: { select: { members: true } } },
        orderBy: { created_at: 'desc' },
    });
};
exports.getStudyGroups = getStudyGroups;
const getStudyGroup = async (id) => {
    const group = await prisma.studyGroup.findUnique({
        where: { id },
        include: { topic: true, members: true },
    });
    if (!group)
        throw (0, errorHandler_1.createAppError)('Study group not found', 404);
    return group;
};
exports.getStudyGroup = getStudyGroup;
const updateStudyGroup = async (id, data) => {
    return prisma.studyGroup.update({
        where: { id },
        data,
        include: { topic: true, members: true },
    });
};
exports.updateStudyGroup = updateStudyGroup;
const removeStudyGroupMember = async (groupId, userId) => {
    await prisma.studyGroupMember.delete({
        where: { userId_studyGroupId: { userId, studyGroupId: groupId } },
    });
};
exports.removeStudyGroupMember = removeStudyGroupMember;
const updateStudyGroupMemberRole = async (groupId, userId, role) => {
    await prisma.studyGroupMember.update({
        where: { userId_studyGroupId: { userId, studyGroupId: groupId } },
        data: { role },
    });
};
exports.updateStudyGroupMemberRole = updateStudyGroupMemberRole;
//# sourceMappingURL=studyGroupService.js.map