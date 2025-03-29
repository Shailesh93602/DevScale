"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const leaderBoardControllers_1 = __importDefault(require("../controllers/leaderBoardControllers"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
class LeaderboardRoutes extends BaseRouter_1.BaseRouter {
    loaderBoardController;
    constructor() {
        super();
        this.loaderBoardController = new leaderBoardControllers_1.default();
        this.router.use(authMiddleware_1.authMiddleware);
    }
    initializeRoutes() {
        this.router.get('/', this.loaderBoardController.getLeaderboardEntries);
    }
}
exports.LeaderboardRoutes = LeaderboardRoutes;
exports.default = new LeaderboardRoutes().getRouter();
//# sourceMappingURL=leaderBoardRoutes.js.map