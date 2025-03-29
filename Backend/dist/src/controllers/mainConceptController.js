"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainConceptController = void 0;
const index_1 = require("../utils/index");
const apiResponse_1 = require("../utils/apiResponse");
const mainConceptRepository_1 = require("../repositories/mainConceptRepository");
class MainConceptController {
    mainConceptRepo;
    constructor() {
        this.mainConceptRepo = new mainConceptRepository_1.MainConceptRepository();
    }
    getAllMainConcepts = (0, index_1.catchAsync)(async (req, res) => {
        const mainConcepts = await this.mainConceptRepo.findMany();
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPTS_FETCHED', {
            data: mainConcepts,
        });
    });
    getMainConceptById = (0, index_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const mainConcept = await this.mainConceptRepo.getMainConceptById(id);
        if (!mainConcept) {
            return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_NOT_FOUND', {
                error: 'Main concept not found',
            });
        }
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_FETCHED', {
            data: mainConcept,
        });
    });
    createMainConcept = (0, index_1.catchAsync)(async (req, res) => {
        const mainConcept = await this.mainConceptRepo.create(req.body);
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_CREATED', {
            data: mainConcept,
        });
    });
    createMainConceptWithSubjects = (0, index_1.catchAsync)(async (req, res) => {
        const mainConcept = await this.mainConceptRepo.createWithSubjects(req.body);
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_CREATED', {
            data: mainConcept,
        });
    });
    updateMainConcept = (0, index_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const mainConcept = await this.mainConceptRepo.updateMainConcept(id, req.body);
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_UPDATED', {
            data: mainConcept,
        });
    });
    deleteMainConcept = (0, index_1.catchAsync)(async (req, res) => {
        const { id } = req.params;
        const mainConcept = await this.mainConceptRepo.deleteMainConcept(id);
        return (0, apiResponse_1.sendResponse)(res, 'MAIN_CONCEPT_DELETED', {
            data: mainConcept,
        });
    });
}
exports.MainConceptController = MainConceptController;
//# sourceMappingURL=mainConceptController.js.map