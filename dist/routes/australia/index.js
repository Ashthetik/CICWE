"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cheerio = __importStar(require("cheerio"));
const state_1 = __importDefault(require("./state"));
const router = (0, express_1.Router)();
router.use(state_1.default);
router.get('/api/v1/ntas/australia', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const source = (yield cheerio.fromURL("https://www.nationalsecurity.gov.au/national-threat-level/current-national-terrorism-threat-level")).html();
    const $ = cheerio.load(source);
    const threatLevel = JSON.parse($("#ThreatLevelJson").contents().text().trim());
    /** NOTE:
     * DTO:
    {
        threat_level: string,
        threat_no: string,
        description: string,
        contacts: {
            email: string,
            phone: {
                string: string,
                ...
            },
            reporting_link: string,
            address: string
        },
        guidelines: [string],
        news: [string]
    }
     */
    res.status(200).json({
        threat_level: threatLevel["ThreatLevelName"],
        threat_no: threatLevel["ThreatLevelNo"],
        description: threatLevel["ThreatLevelDesc"],
        contacts: {
            email: "hotline@nationalsecurity.gov.au",
            phone: {
                "National Security Hotline": "1800 123 400",
                "National Security SMS Hotline": "0498 562 549",
                "National Security Toll-Free Hotline": "(+61) 1300 123 401",
                "National Security TTY Hotline": "1800 234 889",
                "Emergency Services": "000"
            },
            reporting_link: "https://www.nationalsecurity.gov.au/what-can-i-do/report-suspicious-behaviour",
            address: "National Security Hotline\nDepartment of Home Affairs, PO Box 25, Belconnen ACT 2616"
        },
        guidelines: [
            "https://www.nationalsecurity.gov.au/what-can-i-do/what-to-do-in-an-attack"
        ],
        news: [
            "https://www.nationalsecurity.gov.au/news-media/national-security-campaign",
            "https://www.nationalsecurity.gov.au/news-media/archive"
        ]
    });
}));
exports.default = router;
