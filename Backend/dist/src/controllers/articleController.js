"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = __importDefault(require("@/utils/logger"));
const articleRepository_1 = require("@/repositories/articleRepository");
class ArticleController {
    articleRepository;
    constructor() {
        this.articleRepository = new articleRepository_1.ArticleRepository();
    }
    getArticles = (0, utils_1.catchAsync)(async (req, res) => {
        try {
            const { status, search } = req.query;
            const articles = await this.articleRepository.getArticles({
                status,
                search,
            });
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_FETCHED', { data: articles });
        }
        catch (error) {
            logger_1.default.error('Failed to retrieve articles:', error);
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                error: 'Failed to retrieve articles',
            });
        }
    });
    updateArticleStatus = (0, utils_1.catchAsync)(async (req, res) => {
        try {
            const { id, status } = req.query;
            if (!['APPROVED', 'REJECTED'].includes(status)) {
                return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                    error: 'Invalid status value. Please use APPROVED or REJECTED.',
                });
            }
            const article = await this.articleRepository.getArticleById(id);
            if (!article) {
                return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                    error: 'Article not found',
                });
            }
            const updatedArticle = await this.articleRepository.updateArticle(id, {
                status,
            });
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_UPDATED', { data: updatedArticle });
        }
        catch (error) {
            logger_1.default.error('Failed to update article status:', error);
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                error: 'Failed to update article status',
            });
        }
    });
    updateArticleContent = (0, utils_1.catchAsync)(async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content } = req.body;
            if (!title && !content) {
                return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                    error: 'Please provide either title or content to update.',
                });
            }
            const article = await this.articleRepository.getArticleById(id);
            if (!article) {
                return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                    error: 'Article not found',
                });
            }
            const updatedArticle = await this.articleRepository.updateArticle(id, {
                title,
                content,
            });
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_UPDATED', { data: updatedArticle });
        }
        catch (error) {
            logger_1.default.error('Failed to update article content:', error);
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                error: 'Failed to update article content',
            });
        }
    });
    getArticleById = (0, utils_1.catchAsync)(async (req, res) => {
        try {
            const { id } = req.params;
            const article = await this.articleRepository.getArticleById(id);
            if (!article) {
                return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                    error: 'Article not found',
                });
            }
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_FETCHED', { data: article });
        }
        catch (error) {
            logger_1.default.error('Failed to retrieve article:', error);
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                error: 'Failed to retrieve article',
            });
        }
    });
    updateModerationNotes = (0, utils_1.catchAsync)(async (req, res) => {
        try {
            const { id } = req.params;
            const { notes, action } = req.body;
            const moderator_id = req.user?.id;
            if (!notes || !action) {
                return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                    error: 'Notes and action are required',
                });
            }
            if (!moderator_id) {
                return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                    error: 'Moderator ID is required',
                });
            }
            const article = await this.articleRepository.getArticleById(id);
            if (!article) {
                return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                    error: 'Article not found',
                });
            }
            const updatedArticle = await this.articleRepository.updateArticle(id, {
                moderations: {
                    create: [
                        {
                            content_type: 'ARTICLE',
                            action,
                            notes,
                            moderator_id,
                        },
                    ],
                },
            });
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_UPDATED', { data: updatedArticle });
        }
        catch (error) {
            logger_1.default.error('Failed to update moderation notes:', error);
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                error: 'Failed to update moderation notes',
            });
        }
    });
    getMyArticles = (0, utils_1.catchAsync)(async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                    error: 'User ID not found',
                });
            }
            const articles = await this.articleRepository.getArticles({
                author_id: userId,
            });
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_FETCHED', { data: articles });
        }
        catch (error) {
            logger_1.default.error('Failed to retrieve articles:', error);
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                error: 'Failed to retrieve articles',
            });
        }
    });
    getArticleComments = (0, utils_1.catchAsync)(async (req, res) => {
        try {
            const { id } = req.params;
            const article = (await this.articleRepository.getArticleById(id));
            if (!article) {
                return (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                    error: 'Article not found',
                });
            }
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_FETCHED', { data: article.moderations });
        }
        catch (error) {
            logger_1.default.error('Failed to retrieve article comments:', error);
            (0, apiResponse_1.sendResponse)(res, 'ARTICLE_NOT_FOUND', {
                error: 'Failed to retrieve article comments',
            });
        }
    });
}
exports.default = ArticleController;
//# sourceMappingURL=articleController.js.map