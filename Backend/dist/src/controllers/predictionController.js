"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const index_1 = require("../utils/index");
const errorHandler_1 = require("@/utils/errorHandler");
const apiResponse_1 = require("@/utils/apiResponse");
class PredictionController {
    predict = (0, index_1.catchAsync)(async (req, res) => {
        const { data } = req.body;
        if (!data) {
            throw (0, errorHandler_1.createAppError)('Data is required', 400);
        }
        const apiEndpoint = 'https://your-prediction-api.com/predict';
        const response = await axios_1.default.post(apiEndpoint, { data });
        if (response.status === 200) {
            return (0, apiResponse_1.sendResponse)(res, 'PREDICTED', { data: response.data });
        }
        else {
            throw (0, errorHandler_1.createAppError)(response.statusText, response.status);
        }
    });
}
exports.default = PredictionController;
//# sourceMappingURL=predictionController.js.map