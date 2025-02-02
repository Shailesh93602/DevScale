"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes/routes"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = require("./middlewares/passport");
const cloudinary_1 = require("cloudinary");
// import mongoose from "mongoose";
(0, dotenv_1.config)(); // Ensure environment variables are loaded early
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// mongoose.connect(process.env.MONGO_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
// });
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
app.use(routes_1.default);
(0, passport_1.applyPassportStrategy)();
const startServer = async () => {
    try {
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
        console.error('Stack trace:', error.stack);
    }
};
// Graceful shutdown
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    try {
        console.log('Closed database connections.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map