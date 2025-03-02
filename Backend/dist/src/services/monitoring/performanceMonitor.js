"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
const prom_client_1 = require("prom-client");
const logger_1 = __importDefault(require("../../utils/logger"));
class PerformanceMonitor {
    static requestDuration = new prom_client_1.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.1, 0.5, 1, 2, 5],
    });
    static activeConnections = new prom_client_1.Gauge({
        name: 'active_connections',
        help: 'Number of active connections',
    });
    static memoryUsage = new prom_client_1.Gauge({
        name: 'memory_usage_bytes',
        help: 'Memory usage in bytes',
    });
    static trackRequest(method, route, duration, statusCode) {
        this.requestDuration
            .labels(method, route, statusCode.toString())
            .observe(duration);
    }
    static updateConnections(count) {
        this.activeConnections.set(count);
    }
    static startMemoryMonitoring(interval = 60000) {
        setInterval(() => {
            const used = process.memoryUsage();
            this.memoryUsage.set(used.heapUsed);
            // Log if memory usage is high
            if (used.heapUsed > 1024 * 1024 * 1024) {
                // 1GB
                logger_1.default.warn('High memory usage detected', {
                    heapUsed: used.heapUsed,
                    heapTotal: used.heapTotal,
                });
            }
        }, interval);
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
//# sourceMappingURL=performanceMonitor.js.map