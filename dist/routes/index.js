"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const australia_1 = __importDefault(require("./australia"));
const europe_1 = __importDefault(require("./europe"));
const usa_1 = __importDefault(require("./usa"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        message: "OK"
    });
});
router.use(australia_1.default);
router.use(europe_1.default);
router.use(usa_1.default);
exports.default = router;
