"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const articleController_js_1 = require("../controllers/articleController.js");
const router = express_1.default.Router();
router.get('/all', articleController_js_1.getArticles);
router.post('/status', articleController_js_1.updateArticleStatus);
router.post('/:id/moderation', articleController_js_1.updateModerationNotes);
router.get('/my-articles', articleController_js_1.getMyArticles);
router.get('/:id/comments', articleController_js_1.getArticleComments);
router.post('/:id/update', articleController_js_1.updateArticleContent);
router.get('/:id', articleController_js_1.getArticleById);
exports.default = router;
//# sourceMappingURL=articleRoutes.js.map