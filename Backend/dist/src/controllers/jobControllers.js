"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.updateJob = exports.createJob = exports.getJob = exports.getJobs = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const prisma = new client_1.PrismaClient();
exports.getJobs = (0, utils_1.catchAsync)(async (req, res) => {
    const jobs = await prisma.job.findMany({
        orderBy: { created_at: 'asc' },
    });
    return (0, apiResponse_1.sendResponse)(res, 'JOBS_FETCHED', { data: { jobs } });
});
exports.getJob = (0, utils_1.catchAsync)(async (req, res) => {
    const jobId = req.params.id;
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });
    if (!job) {
        return (0, apiResponse_1.sendResponse)(res, 'JOB_NOT_FOUND');
    }
    return (0, apiResponse_1.sendResponse)(res, 'JOB_FETCHED', { data: { job } });
});
exports.createJob = (0, utils_1.catchAsync)(async (req, res) => {
    const { title, description, company, location } = req.body;
    if (!title || !description || !company || !location) {
        return (0, apiResponse_1.sendResponse)(res, 'INVALID_PAYLOAD');
    }
    const job = await prisma.job.create({
        data: { title, description, company, location },
    });
    return (0, apiResponse_1.sendResponse)(res, 'JOB_CREATED', { data: { job } });
});
exports.updateJob = (0, utils_1.catchAsync)(async (req, res) => {
    const jobId = req.params.id;
    const { title, description, company, location } = req.body;
    if (!title || !description || !company || !location) {
        return (0, apiResponse_1.sendResponse)(res, 'INVALID_PAYLOAD');
    }
    const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: { title, description, company, location },
    });
    if (!updatedJob) {
        return (0, apiResponse_1.sendResponse)(res, 'JOB_NOT_FOUND');
    }
    return (0, apiResponse_1.sendResponse)(res, 'JOB_UPDATED', { data: { job: updatedJob } });
});
exports.deleteJob = (0, utils_1.catchAsync)(async (req, res) => {
    const jobId = req.params.id;
    const deletedJob = await prisma.job.delete({
        where: { id: jobId },
    });
    if (!deletedJob) {
        return (0, apiResponse_1.sendResponse)(res, 'JOB_NOT_FOUND');
    }
    return (0, apiResponse_1.sendResponse)(res, 'JOB_DELETED');
});
//# sourceMappingURL=jobControllers.js.map