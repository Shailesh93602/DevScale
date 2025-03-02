"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsService = exports.WebSocketService = void 0;
const socket_io_client_1 = require("socket.io-client");
const config_1 = require("../config");
class WebSocketService {
    socket = null;
    reconnectAttempts = 0;
    MAX_RECONNECT_ATTEMPTS = 5;
    connect() {
        this.socket = (0, socket_io_client_1.io)(config_1.WS_URL, {
            auth: {
                token: localStorage.getItem('token'),
            },
            reconnection: true,
            reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
        });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        if (!this.socket)
            return;
        this.socket.on('connect', () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
        });
        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
        });
        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }
    subscribe(event, callback) {
        this.socket?.on(event, callback);
    }
    unsubscribe(event) {
        this.socket?.off(event);
    }
    emit(event, data) {
        this.socket?.emit(event, data);
    }
    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
}
exports.WebSocketService = WebSocketService;
exports.wsService = new WebSocketService();
//# sourceMappingURL=websocket.js.map