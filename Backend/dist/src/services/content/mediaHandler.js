"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaHandler = void 0;
const cloudinary_1 = require("cloudinary");
const logger_1 = __importDefault(require("../../utils/logger"));
const sharp_1 = __importDefault(require("sharp"));
class MediaHandler {
    static DEFAULT_OPTIONS = {
        folder: 'content',
        allowedFormats: ['jpg', 'png', 'gif', 'webp'],
        transformation: {
            quality: 'auto',
            fetch_format: 'auto',
        },
    };
    static async uploadImage(file, options = {}) {
        try {
            const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
            // Optimize image before upload
            const optimizedImage = await (0, sharp_1.default)(file)
                .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
                .toBuffer();
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.v2.uploader
                    .upload_stream({
                    resource_type: 'image',
                    ...mergedOptions,
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                })
                    .end(optimizedImage);
            });
            return result.secure_url;
        }
        catch (error) {
            logger_1.default.error('Image upload failed:', error);
            throw error;
        }
    }
    static async deleteMedia(publicId) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
        }
        catch (error) {
            logger_1.default.error('Media deletion failed:', error);
            throw error;
        }
    }
    static async optimizeImage(file) {
        return (0, sharp_1.default)(file)
            .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
    }
}
exports.MediaHandler = MediaHandler;
//# sourceMappingURL=mediaHandler.js.map