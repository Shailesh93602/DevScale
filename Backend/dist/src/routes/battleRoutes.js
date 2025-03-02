"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const battleControllers_js_1 = require("../controllers/battleControllers.js");
const validateRequest_js_1 = require("../middlewares/validateRequest.js");
const battleValidations_js_1 = require("../validations/battleValidations.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const router = express_1.default.Router();
router.get('/', battleControllers_js_1.getBattles);
router.get('/:id', battleControllers_js_1.getBattle);
router.post('/create', authMiddleware_js_1.authMiddleware, (0, validateRequest_js_1.validateRequest)(battleValidations_js_1.createBattleValidationSchema), battleControllers_js_1.createBattle);
exports.default = router;
//# sourceMappingURL=battleRoutes.js.map