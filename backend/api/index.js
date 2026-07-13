"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const bootstrap_1 = require("../src/bootstrap");
let server;
async function getServer() {
    if (!server) {
        const app = await (0, bootstrap_1.createApp)({ serveStaticUploads: false });
        await app.init();
        server = app.getHttpAdapter().getInstance();
    }
    return server;
}
async function handler(req, res) {
    const expressApp = await getServer();
    expressApp(req, res);
}
//# sourceMappingURL=index.js.map