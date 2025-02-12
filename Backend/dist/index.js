"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes/routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const passport_1 = require("./middlewares/passport");
const logger_1 = __importDefault(require("./utils/logger"));
const cloudinary_1 = require("cloudinary");
// import mongoose from "mongoose";
// Cloudinary Configuration
cloudinary_1.v2.config({
    cloud_name: config_1.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.CLOUDINARY_API_KEY,
    api_secret: config_1.CLOUDINARY_API_SECRET,
});
// mongoose.connect(process.env.MONGO_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
// });
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
}));
// Body Parser Middlewares
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use((0, cookie_parser_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: config_1.CORS_ORIGIN,
    credentials: true,
}));
// Passport Configuration
(0, passport_1.applyPassportStrategy)();
// Routes
app.use('/api', routes_1.default);
// Error Handler
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        app.listen(config_1.PORT, () => {
            logger_1.default.info(`Server is running on port: ${config_1.PORT}`);
        });
    }
    catch (error) {
        logger_1.default.error('Error starting server:', error);
        process.exit(1);
    }
};
// Graceful shutdown
const shutdown = async () => {
    logger_1.default.info('Shutting down gracefully...');
    try {
        process.exit(0);
    }
    catch (error) {
        logger_1.default.error('Error during shutdown:', error);
        process.exit(1);
    }
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    logger_1.default.error('Unhandled Rejection:', error);
    process.exit(1);
});
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map