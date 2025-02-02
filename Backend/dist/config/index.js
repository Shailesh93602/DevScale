"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.LOG_LEVEL = exports.COMPILER_CLIENT_SECRET = exports.COMPILER_CLIENT_ID = exports.NODE_ENV = exports.RESET_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.MAIL_PASSWORD = exports.MAIL_ADDRESS = void 0;
const dotenv_1 = require("dotenv");
const process = __importStar(require("process"));
(0, dotenv_1.config)();
const { MAIL_ADDRESS, MAIL_PASSWORD, ACCESS_TOKEN_SECRET, RESET_TOKEN_SECRET, NODE_ENV, COMPILER_CLIENT_ID, COMPILER_CLIENT_SECRET, LOG_LEVEL, JWT_SECRET, } = process.env;
exports.MAIL_ADDRESS = MAIL_ADDRESS;
exports.MAIL_PASSWORD = MAIL_PASSWORD;
exports.ACCESS_TOKEN_SECRET = ACCESS_TOKEN_SECRET;
exports.RESET_TOKEN_SECRET = RESET_TOKEN_SECRET;
exports.NODE_ENV = NODE_ENV;
exports.COMPILER_CLIENT_ID = COMPILER_CLIENT_ID;
exports.COMPILER_CLIENT_SECRET = COMPILER_CLIENT_SECRET;
exports.LOG_LEVEL = LOG_LEVEL;
exports.JWT_SECRET = JWT_SECRET;
//# sourceMappingURL=index.js.map