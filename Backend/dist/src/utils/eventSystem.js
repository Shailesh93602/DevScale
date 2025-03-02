"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSystem = void 0;
const events_1 = require("events");
const logger_1 = __importDefault(require("./logger"));
class EventSystem {
    static emitter = new events_1.EventEmitter();
    static MAX_LISTENERS = 100;
    static {
        this.emitter.setMaxListeners(this.MAX_LISTENERS);
    }
    static emit(eventName, data) {
        const eventData = {
            ...data,
            timestamp: Date.now(),
        };
        try {
            this.emitter.emit(eventName, eventData);
            logger_1.default.debug('Event emitted:', { eventName, ...eventData });
        }
        catch (error) {
            logger_1.default.error('Event emission failed:', { eventName, error });
        }
    }
    static on(eventName, handler) {
        try {
            this.emitter.on(eventName, handler);
            logger_1.default.debug('Event handler registered:', { eventName });
        }
        catch (error) {
            logger_1.default.error('Event handler registration failed:', { eventName, error });
        }
    }
    static off(eventName, handler) {
        try {
            this.emitter.off(eventName, handler);
            logger_1.default.debug('Event handler removed:', { eventName });
        }
        catch (error) {
            logger_1.default.error('Event handler removal failed:', { eventName, error });
        }
    }
    static once(eventName, handler) {
        try {
            this.emitter.once(eventName, handler);
            logger_1.default.debug('One-time event handler registered:', { eventName });
        }
        catch (error) {
            logger_1.default.error('One-time event handler registration failed:', {
                eventName,
                error,
            });
        }
    }
}
exports.EventSystem = EventSystem;
//# sourceMappingURL=eventSystem.js.map