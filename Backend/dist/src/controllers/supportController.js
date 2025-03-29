"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supportRepository_1 = __importDefault(require("../repositories/supportRepository"));
const errorHandler_1 = require("../middlewares/errorHandler");
const validateRequest_1 = require("../middlewares/validateRequest");
const apiResponse_1 = require("../utils/apiResponse");
const supportValidations_1 = require("../validations/supportValidations");
const utils_1 = require("@/utils");
class SupportController {
    supportRepo;
    constructor() {
        this.supportRepo = new supportRepository_1.default();
    }
    createTicket = (0, utils_1.catchAsync)(async (req, res) => {
        (0, validateRequest_1.validateRequest)(supportValidations_1.ticketSchema, req.body);
        const ticket = await this.supportRepo.createTicket({
            ...req.body,
            userId: req.user?.id,
        });
        (0, apiResponse_1.sendResponse)(res, 'TICKET_CREATED', { data: ticket });
    });
    updateTicketStatus = (0, utils_1.catchAsync)(async (req, res) => {
        const { ticketId } = req.params;
        const { status } = req.body;
        const ticket = await this.supportRepo.updateTicketStatus(ticketId, status, req.user?.id);
        (0, apiResponse_1.sendResponse)(res, 'TICKET_STATUS_UPDATED', { data: ticket });
    });
    addTicketResponse = (0, utils_1.catchAsync)(async (req, res) => {
        const { ticketId } = req.params;
        const { content, isInternal } = req.body;
        const response = await this.supportRepo.addTicketResponse(ticketId, req.user?.id, content, isInternal);
        (0, apiResponse_1.sendResponse)(res, 'TICKET_RESPONSE_ADDED', { data: response });
    });
    createBugReport = (0, utils_1.catchAsync)(async (req, res) => {
        (0, validateRequest_1.validateRequest)(supportValidations_1.bugReportSchema, req.body);
        const report = await this.supportRepo.createBugReport({
            ...req.body,
            userId: req.user?.id,
        });
        (0, apiResponse_1.sendResponse)(res, 'BUG_REPORT_CREATED', { data: report });
    });
    createFeatureRequest = (0, utils_1.catchAsync)(async (req, res) => {
        (0, validateRequest_1.validateRequest)(supportValidations_1.featureRequestSchema, req.body);
        const request = await this.supportRepo.createFeatureRequest({
            ...req.body,
            userId: req.user?.id,
        });
        (0, apiResponse_1.sendResponse)(res, 'FEATURE_REQUEST_CREATED', { data: request });
    });
    voteFeatureRequest = (0, utils_1.catchAsync)(async (req, res) => {
        const { requestId } = req.params;
        await this.supportRepo.voteFeatureRequest(requestId, req.user?.id);
        (0, apiResponse_1.sendResponse)(res, 'FEATURE_REQUEST_VOTED');
    });
    createHelpArticle = (0, utils_1.catchAsync)(async (req, res) => {
        (0, validateRequest_1.validateRequest)(supportValidations_1.helpArticleSchema, req.body);
        const article = await this.supportRepo.createHelpArticle(req.body);
        (0, apiResponse_1.sendResponse)(res, 'HELP_ARTICLE_CREATED', { data: article });
    });
    searchHelpArticles = (0, utils_1.catchAsync)(async (req, res) => {
        const { query } = req.query;
        if (typeof query !== 'string') {
            throw (0, errorHandler_1.createAppError)('Invalid query parameter', 400);
        }
        const articles = await this.supportRepo.searchHelpArticles(query);
        (0, apiResponse_1.sendResponse)(res, 'HELP_ARTICLES_FETCHED', { data: articles });
    });
}
exports.default = SupportController;
//# sourceMappingURL=supportController.js.map