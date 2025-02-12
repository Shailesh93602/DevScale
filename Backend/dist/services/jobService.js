"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.getJobs = exports.getJob = exports.updateJob = exports.createJob = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new client_1.PrismaClient();
const createJob = async (data) => {
    return prisma.job.create({
        data: {
            ...data,
            postedDate: data.postedDate || new Date(),
        },
    });
};
exports.createJob = createJob;
const updateJob = async (id, data) => {
    return prisma.job.update({
        where: { id },
        data,
    });
};
exports.updateJob = updateJob;
const getJob = async (id) => {
    const job = await prisma.job.findUnique({
        where: { id },
    });
    if (!job) {
        throw (0, errorHandler_1.createAppError)('Job not found', 404);
    }
    return job;
};
exports.getJob = getJob;
const getJobs = async (filters) => {
    return prisma.job.findMany({
        where: {
            jobType: filters?.jobType,
            location: filters?.location
                ? { contains: filters.location, mode: 'insensitive' }
                : undefined,
            salary: filters?.minSalary ? { gte: filters.minSalary } : undefined,
            OR: filters?.search
                ? [
                    { title: { contains: filters.search, mode: 'insensitive' } },
                    { company: { contains: filters.search, mode: 'insensitive' } },
                    {
                        description: { contains: filters.search, mode: 'insensitive' },
                    },
                ]
                : undefined,
        },
        orderBy: {
            postedDate: 'desc',
        },
    });
};
exports.getJobs = getJobs;
const deleteJob = async (id) => {
    await prisma.job.delete({
        where: { id },
    });
};
exports.deleteJob = deleteJob;
//# sourceMappingURL=jobService.js.map