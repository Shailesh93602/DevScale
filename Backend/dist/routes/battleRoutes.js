"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const battleControllers_js_1 = require("../controllers/battleControllers.js");
const validationMiddleware_js_1 = require("../middlewares/validationMiddleware.js");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
router.get('/', battleControllers_js_1.getBattles);
router.get('/:id', battleControllers_js_1.getBattle);
router.post('/create', passport_1.default.authenticate('jwt', { session: false }), validationMiddleware_js_1.validateBattleCreation, battleControllers_js_1.createBattle);
exports.default = router;
//# sourceMappingURL=battleRoutes.js.map