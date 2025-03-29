"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const articleController_1 = __importDefault(require("../controllers/articleController"));
class ArticleRoutes extends BaseRouter_1.BaseRouter {
    articleController;
    constructor() {
        super();
        this.articleController = new articleController_1.default();
    }
    initializeRoutes() {
        this.router.get('/all', this.articleController.getArticles);
        this.router.post('/status', this.articleController.updateArticleStatus);
        this.router.post('/:id/moderation', this.articleController.updateModerationNotes);
        this.router.get('/my-articles', this.articleController.getMyArticles);
        this.router.get('/:id/comments', this.articleController.getArticleComments);
        this.router.post('/:id/update', this.articleController.updateArticleContent);
        this.router.get('/:id', this.articleController.getArticleById);
    }
}
exports.ArticleRoutes = ArticleRoutes;
exports.default = new ArticleRoutes().getRouter();
//# sourceMappingURL=articleRoutes.js.map