"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../utils/index");
const apiResponse_1 = require("../utils/apiResponse");
const subjectRepository_1 = __importDefault(require("../repositories/subjectRepository"));
class SubjectController {
    subjectRepository;
    constructor() {
        this.subjectRepository = new subjectRepository_1.default();
    }
    getAllSubjects = (0, index_1.catchAsync)(async (req, res) => {
        const { limit = 10, page = 1, search = '' } = req.query;
        const subjects = await this.subjectRepository.paginate({
            limit: Number(limit),
            page: Number(page),
            search: String(search),
        }, ['title']);
        return (0, apiResponse_1.sendResponse)(res, 'SUBJECTS_FETCHED', { data: subjects });
    });
    getTopicsInSubject = (0, index_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const subject = await this.subjectRepository.findUnique({
            where: { id },
            include: {
                topics: {
                    select: {
                        topic: true,
                    },
                },
            },
        });
        if (!subject) {
            return (0, apiResponse_1.sendResponse)(res, 'SUBJECT_NOT_FOUND');
        }
        return (0, apiResponse_1.sendResponse)(res, 'TOPICS_FETCHED', { data: subject });
    });
    createSubject = (0, index_1.catchAsync)(async (req, res) => {
        const subject = await this.subjectRepository.create(req.body);
        return (0, apiResponse_1.sendResponse)(res, 'SUBJECT_CREATED', { data: subject });
    });
    updateSubject = (0, index_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const subject = await this.subjectRepository.update({
            where: { id },
            data: req.body,
        });
        return (0, apiResponse_1.sendResponse)(res, 'SUBJECT_UPDATED', { data: subject });
    });
    deleteSubject = (0, index_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const subject = await this.subjectRepository.delete({ where: { id } });
        return (0, apiResponse_1.sendResponse)(res, 'SUBJECT_DELETED', { data: subject });
    });
}
exports.default = SubjectController;
//# sourceMappingURL=subjectController.js.map