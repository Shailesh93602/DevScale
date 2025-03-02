"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeService = exports.RealtimeService = void 0;
const websocket_1 = require("./websocket");
class RealtimeService {
    subscribers = new Map();
    initialize() {
        websocket_1.wsService.connect();
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        websocket_1.wsService.subscribe('data_update', (update) => {
            const subscribers = this.subscribers.get(update.entity);
            subscribers?.forEach((callback) => callback(update));
        });
    }
    subscribe(entity, callback) {
        if (!this.subscribers.has(entity)) {
            this.subscribers.set(entity, new Set());
        }
        this.subscribers.get(entity)?.add(callback);
    }
    unsubscribe(entity, callback) {
        this.subscribers.get(entity)?.delete(callback);
    }
    cleanup() {
        this.subscribers.clear();
        websocket_1.wsService.disconnect();
    }
}
exports.RealtimeService = RealtimeService;
exports.realtimeService = new RealtimeService();
//# sourceMappingURL=realtime.js.map