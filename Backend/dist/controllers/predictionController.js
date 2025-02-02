"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.predict = void 0;
const axios_1 = __importDefault(require("axios"));
const index_1 = require("../utils/index");
exports.predict = (0, index_1.catchAsync)(async (req, res) => {
    const { data } = req.body;
    if (!data) {
        return res
            .status(400)
            .json({ success: false, message: 'Data is required' });
    }
    const apiEndpoint = 'https://your-prediction-api.com/predict';
    const response = await axios_1.default.post(apiEndpoint, { data });
    if (response.status === 200) {
        return res.status(200).json({ success: true, prediction: response.data });
    }
    else {
        return res
            .status(response.status)
            .json({ success: false, message: response.statusText });
    }
});
//# sourceMappingURL=predictionController.js.map