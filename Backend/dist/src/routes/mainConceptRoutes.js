"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainConceptRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const mainConceptController_1 = require("../controllers/mainConceptController");
class MainConceptRoutes extends BaseRouter_1.BaseRouter {
    mainConceptController;
    constructor() {
        super();
        this.mainConceptController = new mainConceptController_1.MainConceptController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Public routes
        this.router.get('/', this.mainConceptController.getAllMainConcepts);
        this.router.get('/:id', this.mainConceptController.getMainConceptById);
        // Protected routes
        this.router.post('/', this.mainConceptController.createMainConcept);
        this.router.post('/with-subjects', this.mainConceptController.createMainConceptWithSubjects);
        this.router.put('/:id', this.mainConceptController.updateMainConcept);
        this.router.delete('/:id', this.mainConceptController.deleteMainConcept);
    }
}
exports.MainConceptRoutes = MainConceptRoutes;
// Create and export an instance of the routes
exports.default = new MainConceptRoutes().getRouter();
//# sourceMappingURL=mainConceptRoutes.js.map