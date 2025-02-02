"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.updateJob = exports.createJob = exports.getJob = exports.getJobs = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const prisma = new client_1.PrismaClient();
exports.getJobs = (0, utils_1.catchAsync)(async (req, res) => {
    const jobs = await prisma.job.findMany({
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({ success: true, jobs });
});
exports.getJob = (0, utils_1.catchAsync)(async (req, res) => {
    const jobId = req.params.id;
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });
    if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, job });
});
exports.createJob = (0, utils_1.catchAsync)(async (req, res) => {
    const { title, description, company, location } = req.body;
    if (!title || !description || !company || !location) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    await prisma.job.create({
        data: { title, description, company, location },
    });
    res.status(201).json({ success: true, message: 'Job created successfully!' });
});
exports.updateJob = (0, utils_1.catchAsync)(async (req, res) => {
    const jobId = req.params.id;
    const { title, description, company, location } = req.body;
    if (!title || !description || !company || !location) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: { title, description, company, location },
    });
    if (!updatedJob) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, message: 'Job updated successfully!' });
});
exports.deleteJob = (0, utils_1.catchAsync)(async (req, res) => {
    const jobId = req.params.id;
    const deletedJob = await prisma.job.delete({
        where: { id: jobId },
    });
    if (!deletedJob) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, message: 'Job deleted successfully!' });
});
//# sourceMappingURL=jobControllers.js.map