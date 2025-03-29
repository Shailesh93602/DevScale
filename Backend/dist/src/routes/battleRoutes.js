"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const battleControllers_1 = __importDefault(require("../controllers/battleControllers"));
const validateRequest_1 = require("../middlewares/validateRequest");
const battleValidations_1 = require("../validations/battleValidations");
const authMiddleware_1 = require("../middlewares/authMiddleware");
class BattleRoutes extends BaseRouter_1.BaseRouter {
    battleController;
    constructor() {
        super();
        this.battleController = new battleControllers_1.default();
    }
    initializeRoutes() {
        this.router.get('/', this.battleController.getBattles);
        this.router.get('/:id', this.battleController.getBattle);
        this.router.post('/create', authMiddleware_1.authMiddleware, (0, validateRequest_1.validateRequest)(battleValidations_1.createBattleValidationSchema), this.battleController.createBattle);
    }
}
exports.BattleRoutes = BattleRoutes;
exports.default = new BattleRoutes().getRouter();
//# sourceMappingURL=battleRoutes.js.map