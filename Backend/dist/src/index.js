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
const client_1 = require("@prisma/client");
class App {
    app;
    prisma;
    constructor() {
        this.app = (0, express_1.default)();
        this.prisma = new client_1.PrismaClient();
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
        this.app.use((0, helmet_1.default)());
        this.app.use((0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 100,
        }));
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
        this.app.use((0, cookie_parser_1.default)());
        this.app.use((0, cors_1.default)({
            origin: config_1.CORS_ORIGIN,
            credentials: true,
        }));
    }
    initializeRoutes() {
        const appRoutes = new routes_1.AppRoutes();
        this.app.use('/api/v1', appRoutes.getRouter());
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    async start() {
        try {
            await this.prisma.$connect();
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
    setupGracefulShutdown(server) {
        const shutdown = async (signal) => {
            logger_1.default.info(`${signal} received: closing server`);
            server.close(async () => {
                await this.prisma.$disconnect();
                logger_1.default.info('Server closed');
                process.exit(0);
            });
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('uncaughtException', (error) => {
            logger_1.default.error('Uncaught Exception:', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (error) => {
            logger_1.default.error('Unhandled Rejection:', error);
            process.exit(1);
        });
    }
}
exports.App = App;
const app = new App();
app.start();
exports.default = app;
//# sourceMappingURL=index.js.map