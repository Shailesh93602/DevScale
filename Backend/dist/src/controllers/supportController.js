"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchHelpArticles = exports.createHelpArticle = exports.voteFeatureRequest = exports.createFeatureRequest = exports.createBugReport = exports.addTicketResponse = exports.updateTicketStatus = exports.createTicket = void 0;
const supportService_1 = require("../services/supportService");
const errorHandler_1 = require("../middlewares/errorHandler");
const validateRequest_1 = require("../middlewares/validateRequest");
const supportValidations_1 = require("../validations/supportValidations");
const createTicket = async (req, res, next) => {
    try {
        (0, validateRequest_1.validateRequest)(supportValidations_1.ticketSchema, req.body);
        const ticket = await supportService_1.SupportService.createTicket({
            ...req.body,
            userId: req.user.id,
        });
        res.status(201).json({ success: true, data: ticket });
    }
    catch (error) {
        next(error);
    }
};
exports.createTicket = createTicket;
const updateTicketStatus = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;
        const ticket = await supportService_1.SupportService.updateTicketStatus(ticketId, status, req.user.id);
        res.json({ success: true, data: ticket });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTicketStatus = updateTicketStatus;
const addTicketResponse = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { content, isInternal } = req.body;
        const response = await supportService_1.SupportService.addTicketResponse(ticketId, req.user.id, content, isInternal);
        res.status(201).json({ success: true, data: response });
    }
    catch (error) {
        next(error);
    }
};
exports.addTicketResponse = addTicketResponse;
const createBugReport = async (req, res, next) => {
    try {
        (0, validateRequest_1.validateRequest)(supportValidations_1.bugReportSchema, req.body);
        const report = await supportService_1.SupportService.createBugReport({
            ...req.body,
            userId: req.user.id,
        });
        res.status(201).json({ success: true, data: report });
    }
    catch (error) {
        next(error);
    }
};
exports.createBugReport = createBugReport;
const createFeatureRequest = async (req, res, next) => {
    try {
        (0, validateRequest_1.validateRequest)(supportValidations_1.featureRequestSchema, req.body);
        const request = await supportService_1.SupportService.createFeatureRequest({
            ...req.body,
            userId: req.user.id,
        });
        res.status(201).json({ success: true, data: request });
    }
    catch (error) {
        next(error);
    }
};
exports.createFeatureRequest = createFeatureRequest;
const voteFeatureRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        await supportService_1.SupportService.voteFeatureRequest(requestId, req.user.id);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
exports.voteFeatureRequest = voteFeatureRequest;
const createHelpArticle = async (req, res, next) => {
    try {
        (0, validateRequest_1.validateRequest)(supportValidations_1.helpArticleSchema, req.body);
        const article = await supportService_1.SupportService.createHelpArticle(req.body);
        res.status(201).json({ success: true, data: article });
    }
    catch (error) {
        next(error);
    }
};
exports.createHelpArticle = createHelpArticle;
const searchHelpArticles = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (typeof query !== 'string') {
            throw (0, errorHandler_1.createAppError)('Invalid query parameter', 400);
        }
        const articles = await supportService_1.SupportService.searchHelpArticles(query);
        res.json({ success: true, data: articles });
    }
    catch (error) {
        next(error);
    }
};
exports.searchHelpArticles = searchHelpArticles;
//# sourceMappingURL=supportController.js.map