"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = require("../config");
const logger_1 = __importDefault(require("./logger"));
const errorHandler_1 = require("./errorHandler");
cloudinary_1.v2.config({
    cloud_name: config_1.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.CLOUDINARY_API_KEY,
    api_secret: config_1.CLOUDINARY_API_SECRET,
});
const uploadToCloudinary = async (file, folder) => {
    try {
        const result = await cloudinary_1.v2.uploader.upload(file.path, {
            folder: `mr_engineers/${folder}`,
        });
        return result.secure_url;
    }
    catch (error) {
        logger_1.default.error('Error uploading file to Cloudinary', error);
        throw (0, errorHandler_1.createAppError)('Error uploading file to cloudinary', 500);
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
//# sourceMappingURL=cloudinary.js.map