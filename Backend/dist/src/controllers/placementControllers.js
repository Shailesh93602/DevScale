"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../utils/errorHandler");
const utils_1 = require("../utils");
const placementValidation_1 = require("../validations/placementValidation");
const placementRepository_1 = __importDefault(require("@/repositories/placementRepository"));
const apiResponse_1 = require("@/utils/apiResponse");
class PlacementController {
    placementRepo;
    constructor() {
        this.placementRepo = new placementRepository_1.default();
    }
    getResources = (0, utils_1.catchAsync)(async (req, res) => {
        const { error, value } = placementValidation_1.getResourcesSchema.validate(req.query);
        if (error)
            throw (0, errorHandler_1.createAppError)(error.message, 400);
        const resources = await this.placementRepo.getPlacementResources(value.userId, value.subjectId);
        (0, apiResponse_1.sendResponse)(res, 'RESOURCES_FETCHED', { data: resources });
    });
    getBooks = (0, utils_1.catchAsync)(async (req, res) => {
        const { error, value } = placementValidation_1.getBooksSchema.validate(req.query);
        if (error)
            throw (0, errorHandler_1.createAppError)(error.message, 400);
        const books = await this.placementRepo.getRecommendedBooks(value.subjectId, value.level);
        (0, apiResponse_1.sendResponse)(res, 'BOOKS_FETCHED', { data: books });
    });
}
exports.default = PlacementController;
//# sourceMappingURL=placementControllers.js.map