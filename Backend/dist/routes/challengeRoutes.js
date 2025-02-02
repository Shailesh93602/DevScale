"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const challengeController_js_1 = require("../controllers/challengeController.js");
const router = express_1.default.Router();
router.get('/', challengeController_js_1.getChallenges);
router.get('/:id', challengeController_js_1.getChallenge);
exports.default = router;
//# sourceMappingURL=challengeRoutes.js.map