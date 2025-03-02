"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const placementControllers_1 = require("../controllers/placementControllers");
const router = express_1.default.Router();
router.get('/resources', placementControllers_1.getResources);
router.get('/books', placementControllers_1.getBooks);
exports.default = router;
//# sourceMappingURL=placementRoutes.js.map