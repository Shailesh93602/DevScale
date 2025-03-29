"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityForumRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const communityForumControllers_1 = __importDefault(require("../controllers/communityForumControllers"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
class CommunityForumRoutes extends BaseRouter_1.BaseRouter {
    communityForumController;
    constructor() {
        super();
        this.communityForumController = new communityForumControllers_1.default();
        this.router.use(authMiddleware_1.authMiddleware);
    }
    initializeRoutes() {
        this.router.get('/', this.communityForumController.getForums);
        this.router.get('/:id', this.communityForumController.getForum);
        this.router.post('/create', this.communityForumController.createForum);
        this.router.put('/update/:id', this.communityForumController.updateForum);
        this.router.delete('/delete/:id', this.communityForumController.deleteForum);
    }
}
exports.CommunityForumRoutes = CommunityForumRoutes;
exports.default = new CommunityForumRoutes().getRouter();
//# sourceMappingURL=communityForumRoutes.js.map