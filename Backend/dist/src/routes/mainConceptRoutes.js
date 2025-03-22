"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mainConceptController_1 = require("../controllers/mainConceptController");
const router = (0, express_1.Router)();
// Public routes
router.get('/', mainConceptController_1.getAllMainConcepts);
router.get('/:id', mainConceptController_1.getMainConceptById);
router.get('/:id/subjects', mainConceptController_1.getSubjectsInMainConcept);
// Protected routes
router.post('/', mainConceptController_1.createMainConcept);
router.put('/:id', mainConceptController_1.updateMainConcept);
router.delete('/:id', mainConceptController_1.deleteMainConcept);
exports.default = router;
//# sourceMappingURL=mainConceptRoutes.js.map