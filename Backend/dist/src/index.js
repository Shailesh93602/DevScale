"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const routes_1 = require("./routes/routes");
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = __importDefault(require("./utils/logger"));
const cloudinary_1 = require("cloudinary");
const prisma_1 = __importDefault(require("./lib/prisma"));
class App {
    app;
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeCloudinary();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeCloudinary() {
        cloudinary_1.v2.config({
            cloud_name: config_1.CLOUDINARY_CLOUD_NAME,
            api_key: config_1.CLOUDINARY_API_KEY,
            api_secret: config_1.CLOUDINARY_API_SECRET,
        });
    }
    initializeMiddlewares() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cookie_parser_1.default)());
        this.app.use((0, cors_1.default)({
            origin: config_1.CORS_ORIGIN,
            credentials: true,
        }));
        this.app.use((0, helmet_1.default)());
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
        });
        this.app.use(limiter);
    }
    initializeRoutes() {
        const appRoutes = new routes_1.AppRoutes();
        this.app.use('/', appRoutes.getRouter());
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    setupGracefulShutdown(server) {
        process.on('SIGTERM', () => {
            logger_1.default.info('SIGTERM signal received.');
            server.close(async () => {
                logger_1.default.info('HTTP server closed.');
                await prisma_1.default.$disconnect();
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            logger_1.default.info('SIGINT signal received.');
            server.close(async () => {
                logger_1.default.info('HTTP server closed.');
                await prisma_1.default.$disconnect();
                process.exit(0);
            });
        });
    }
    async start() {
        try {
            await prisma_1.default.$connect();
            logger_1.default.info('Connected to PostgreSQL database');
            const server = this.app.listen(config_1.PORT, () => {
                logger_1.default.info(`Server running on port ${config_1.PORT}`);
            });
            this.setupGracefulShutdown(server);
        }
        catch (error) {
            logger_1.default.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}
exports.App = App;
const app = new App();
app.start();
exports.default = app;
//# sourceMappingURL=index.js.map