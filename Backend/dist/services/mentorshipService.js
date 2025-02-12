"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMentorshipSession = exports.getMentorshipDetails = exports.getMentorshipRequests = exports.updateMentorshipStatus = exports.requestMentorship = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cacheService_1 = require("./cacheService");
const prisma = new client_1.PrismaClient();
const requestMentorship = async (data) => {
    const existing = await prisma.mentorship.findUnique({
        where: {
            mentorId_menteeId: {
                mentorId: data.mentorId,
                menteeId: data.menteeId,
            },
        },
    });
    if (existing)
        throw (0, errorHandler_1.createAppError)('Mentorship request already exists', 400);
    const mentorship = await prisma.mentorship.create({
        data: {
            ...data,
            status: client_1.MentorshipStatus.pending,
        },
        include: {
            mentor: {
                select: { username: true, avatar_url: true, experience_level: true },
            },
            mentee: { select: { username: true, avatar_url: true } },
        },
    });
    await (0, cacheService_1.deleteCache)(`mentor:${data.mentorId}:requests`);
    await (0, cacheService_1.deleteCache)(`mentee:${data.menteeId}:requests`);
    return mentorship;
};
exports.requestMentorship = requestMentorship;
const updateMentorshipStatus = async (id, status) => {
    const mentorship = await prisma.mentorship.update({
        where: { id },
        data: { status },
        include: {
            mentor: { select: { username: true, avatar_url: true } },
            mentee: { select: { username: true, avatar_url: true } },
        },
    });
    await (0, cacheService_1.deleteCache)(`mentor:${mentorship.mentorId}:requests`);
    await (0, cacheService_1.deleteCache)(`mentee:${mentorship.menteeId}:requests`);
    return mentorship;
};
exports.updateMentorshipStatus = updateMentorshipStatus;
const getMentorshipRequests = async (userId, role) => {
    const cacheKey = `mentorship:${userId}:${role}`;
    const cached = await (0, cacheService_1.getCache)(cacheKey);
    if (cached)
        return cached;
    const requests = await prisma.mentorship.findMany({
        where: role === 'mentor' ? { mentorId: userId } : { menteeId: userId },
        include: {
            mentor: {
                select: { username: true, avatar_url: true, experience_level: true },
            },
            mentee: { select: { username: true, avatar_url: true } },
        },
        orderBy: { created_at: 'desc' },
    });
    await (0, cacheService_1.setCache)(cacheKey, requests, { ttl: 3600 });
    return requests;
};
exports.getMentorshipRequests = getMentorshipRequests;
const getMentorshipDetails = async (id) => {
    const cacheKey = `mentorship:${id}`;
    const cached = await (0, cacheService_1.getCache)(cacheKey);
    if (cached)
        return cached;
    const mentorship = await prisma.mentorship.findUnique({
        where: { id },
        include: {
            mentor: {
                select: { username: true, avatar_url: true, experience_level: true },
            },
            mentee: { select: { username: true, avatar_url: true } },
        },
    });
    if (!mentorship)
        throw (0, errorHandler_1.createAppError)('Mentorship not found', 404);
    await (0, cacheService_1.setCache)(cacheKey, mentorship, { ttl: 3600 });
    return mentorship;
};
exports.getMentorshipDetails = getMentorshipDetails;
const addMentorshipSession = async (mentorshipId, data) => {
    const session = await prisma.mentorshipSession.create({
        data: {
            ...data,
            mentorship: { connect: { id: mentorshipId } },
        },
    });
    await (0, cacheService_1.deleteCache)(`mentorship:${mentorshipId}`);
    return session;
};
exports.addMentorshipSession = addMentorshipSession;
//# sourceMappingURL=mentorshipService.js.map