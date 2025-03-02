"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaderBoardControllers_1 = require("../controllers/leaderBoardControllers");
const router = express_1.default.Router();
router.get('/', leaderBoardControllers_1.getLeaderboardEntries);
exports.default = router;
//# sourceMappingURL=leaderBoardRoutes.js.map