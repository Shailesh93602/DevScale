"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinaryConfig_js_1 = __importDefault(require("../config/cloudinaryConfig.js"));
const stream_1 = require("stream");
const uploadMiddleware = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const stream = new stream_1.Readable();
        stream.push(req.file.buffer);
        stream.push(null);
        const result = await new Promise((resolve, reject) => {
            stream.pipe(cloudinaryConfig_js_1.default.uploader.upload_stream((error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            }));
        });
        req.fileUrl = result.secure_url;
        next();
    }
    catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload file to Cloudinary' });
        return;
    }
};
exports.default = uploadMiddleware;
//# sourceMappingURL=uploadMiddleware.js.map