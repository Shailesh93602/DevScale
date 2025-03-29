"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacementRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const placementControllers_1 = __importDefault(require("../controllers/placementControllers"));
class PlacementRoutes extends BaseRouter_1.BaseRouter {
    placementController;
    constructor() {
        super();
        this.placementController = new placementControllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/resources', this.placementController.getResources);
        this.router.get('/books', this.placementController.getBooks);
    }
}
exports.PlacementRoutes = PlacementRoutes;
exports.default = new PlacementRoutes().getRouter();
//# sourceMappingURL=placementRoutes.js.map