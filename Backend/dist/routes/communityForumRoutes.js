"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const communityForumControllers_js_1 = require("../controllers/communityForumControllers.js");
const router = express_1.default.Router();
router.get('/', communityForumControllers_js_1.getForums);
router.get('/:id', communityForumControllers_js_1.getForum);
router.post('/create', communityForumControllers_js_1.createForum);
router.put('/update/:id', communityForumControllers_js_1.updateForum);
router.delete('/delete/:id', communityForumControllers_js_1.deleteForum);
exports.default = router;
//# sourceMappingURL=communityForumRoutes.js.map