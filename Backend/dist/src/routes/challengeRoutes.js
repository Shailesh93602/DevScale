"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const challengeController_1 = __importDefault(require("../controllers/challengeController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const challengeValidation_1 = require("../validations/challengeValidation");
class ChallengeRoutes extends BaseRouter_1.BaseRouter {
    challengeController;
    constructor() {
        super();
        this.challengeController = new challengeController_1.default();
        this.router.use(authMiddleware_1.authMiddleware);
    }
    initializeRoutes() {
        // Public routes
        this.router.get('/', this.challengeController.getChallenges);
        this.router.get('/leaderboard', this.challengeController.getChallengeLeaderboard);
        this.router.get('/:id', this.challengeController.getChallenge);
        // Protected routes
        this.router.post('/', 
        // authorizeRoles('admin', 'instructor'),
        (0, validateRequest_1.validateRequest)(challengeValidation_1.createChallengeValidation), this.challengeController.createNewChallenge);
        this.router.patch('/:id', 
        // authorizeRoles('admin', 'instructor'),
        (0, validateRequest_1.validateRequest)(challengeValidation_1.createChallengeValidation), this.challengeController.updateExistingChallenge);
        this.router.post('/:challengeId/submit', (0, validateRequest_1.validateRequest)(challengeValidation_1.submitChallengeValidation), this.challengeController.submitChallengeAttempt);
    }
}
exports.ChallengeRoutes = ChallengeRoutes;
exports.default = new ChallengeRoutes().getRouter();
//# sourceMappingURL=challengeRoutes.js.map