import express, { Express } from "express";
import CORS from "cors";
import Helmet from "helmet";
import HTTPS from "node:https"
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import Router from "./router";

const app: Express = express();

app.use(Helmet({
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

app.use(CORS({
    methods: ["GET", "HEAD", "OPTIONS"],
    preflightContinue: true,
    optionsSuccessStatus: 204
}));

Router(app);

if ((process.env.NODE_PRODUCTION as any as boolean) === true) {
    const server = HTTPS.createServer({
        key: readFileSync(resolve(__dirname, "certs", "key.pem")),
        cert: readFileSync(resolve(__dirname, "certs", "cert.pem")),
        secureProtocol: "SSLv23_method",
        secureOptions: require("constants").SSL_OP_NO_SSLv3,
    }, app);

    server.listen(443, "0.0.0.0", () => {
        console.info(`[?] Server running on public port: 443`);
    });
} else {
    app.listen(8080, () => {
        console.info(`[?] Server running on private port: 8080`);
    });
}
