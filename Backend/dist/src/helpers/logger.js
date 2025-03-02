"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_transport_1 = __importDefault(require("winston-transport"));
const config_1 = require("../config");
const { combine, json, timestamp, printf } = winston_1.default.format;
class NoOpTransport extends winston_transport_1.default {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        callback();
    }
}
const transports = [new NoOpTransport()];
exports.logger = winston_1.default.createLogger({
    level: config_1.LOG_LEVEL ?? 'info',
    format: combine(timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }), json(), printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)),
    transports,
});
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map