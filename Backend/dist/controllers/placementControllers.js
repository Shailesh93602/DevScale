"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooks = exports.getResources = void 0;
const placementService_1 = require("../services/placementService");
const errorHandler_1 = require("../utils/errorHandler");
const utils_1 = require("../utils");
const placementValidation_1 = require("../validations/placementValidation");
exports.getResources = (0, utils_1.catchAsync)(async (req, res) => {
    const { error, value } = placementValidation_1.getResourcesSchema.validate(req.query);
    if (error)
        throw (0, errorHandler_1.createAppError)(error.message, 400);
    const resources = await (0, placementService_1.getPlacementResources)(value.userId, value.subjectId);
    res.status(200).json({
        status: 'success',
        data: resources,
    });
});
exports.getBooks = (0, utils_1.catchAsync)(async (req, res) => {
    const { error, value } = placementValidation_1.getBooksSchema.validate(req.query);
    if (error)
        throw (0, errorHandler_1.createAppError)(error.message, 400);
    const books = await (0, placementService_1.getRecommendedBooks)(value.subjectId, value.level);
    res.status(200).json({
        status: 'success',
        data: books,
    });
});
//# sourceMappingURL=placementControllers.js.map