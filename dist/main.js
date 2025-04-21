"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const node_https_1 = __importDefault(require("node:https"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const router_1 = __importDefault(require("./router"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    frameguard: {
        action: "deny"
    },
    noSniff: true,
    xssFilter: true,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                'https://cdnjs.cloudflare.com', // Allow scripts from the CDN
            ],
            styleSrc: [
                "'self'",
                'https://cdnjs.cloudflare.com' // Allow styles from the CDN
            ],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
        }
    },
    dnsPrefetchControl: {
        allow: false
    }
}));
app.use((0, cors_1.default)({
    methods: ["GET", "HEAD", "OPTIONS"],
    preflightContinue: true,
    optionsSuccessStatus: 204
}));
(0, router_1.default)(app);
if (process.env.NODE_PRODUCTION === true) {
    const server = node_https_1.default.createServer({
        key: (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(__dirname, "certs", "key.pem")),
        cert: (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(__dirname, "certs", "cert.pem")),
        secureProtocol: "SSLv23_method",
        secureOptions: require("constants").SSL_OP_NO_SSLv3,
    }, app);
    server.listen(443, "0.0.0.0", () => {
        console.info(`[?] Server running on public port: 443`);
    });
}
else {
    app.listen(8080, () => {
        console.info(`[?] Server running on private port: 8080`);
    });
}
