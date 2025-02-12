"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTestServer = startTestServer;
exports.stopTestServer = stopTestServer;
const app_1 = require("../../app");
let server;
async function startTestServer() {
    return new Promise((resolve) => {
        server = app_1.app.listen(0, () => {
            const { port } = server.address();
            const baseUrl = `http://localhost:${port}`;
            resolve(baseUrl);
        });
    });
}
async function stopTestServer() {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
//# sourceMappingURL=testServer.js.map