"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const jobRepository_1 = __importDefault(require("@/repositories/jobRepository"));
class JobController {
    jobRepo;
    constructor() {
        this.jobRepo = new jobRepository_1.default();
    }
    getJobs = (0, utils_1.catchAsync)(async (req, res) => {
        const jobs = await this.jobRepo.findMany({
            orderBy: { created_at: 'asc' },
        });
        return (0, apiResponse_1.sendResponse)(res, 'JOBS_FETCHED', { data: { jobs } });
    });
    getJob = (0, utils_1.catchAsync)(async (req, res) => {
        const jobId = req.params.id;
        const job = await this.jobRepo.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            return (0, apiResponse_1.sendResponse)(res, 'JOB_NOT_FOUND');
        }
        return (0, apiResponse_1.sendResponse)(res, 'JOB_FETCHED', { data: { job } });
    });
    createJob = (0, utils_1.catchAsync)(async (req, res) => {
        const { title, description, company, location } = req.body;
        if (!title || !description || !company || !location) {
            return (0, apiResponse_1.sendResponse)(res, 'INVALID_PAYLOAD');
        }
        const job = await this.jobRepo.create({
            data: { title, description, company, location },
        });
        return (0, apiResponse_1.sendResponse)(res, 'JOB_CREATED', { data: { job } });
    });
    updateJob = (0, utils_1.catchAsync)(async (req, res) => {
        const jobId = req.params.id;
        const { title, description, company, location } = req.body;
        if (!title || !description || !company || !location) {
            return (0, apiResponse_1.sendResponse)(res, 'INVALID_PAYLOAD');
        }
        const updatedJob = await this.jobRepo.update({
            where: { id: jobId },
            data: { title, description, company, location },
        });
        if (!updatedJob) {
            return (0, apiResponse_1.sendResponse)(res, 'JOB_NOT_FOUND');
        }
        return (0, apiResponse_1.sendResponse)(res, 'JOB_UPDATED', { data: { job: updatedJob } });
    });
    deleteJob = (0, utils_1.catchAsync)(async (req, res) => {
        const jobId = req.params.id;
        const deletedJob = await this.jobRepo.delete({
            where: { id: jobId },
        });
        if (!deletedJob) {
            return (0, apiResponse_1.sendResponse)(res, 'JOB_NOT_FOUND');
        }
        return (0, apiResponse_1.sendResponse)(res, 'JOB_DELETED');
    });
}
exports.default = JobController;
//# sourceMappingURL=jobControllers.js.map