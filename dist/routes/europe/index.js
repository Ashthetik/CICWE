"use strict";
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
const rss_parser_1 = __importDefault(require("rss-parser"));
const router = (0, express_1.Router)();
function getDataFromMI5() {
    return __awaiter(this, void 0, void 0, function* () {
        const parser = new rss_parser_1.default();
        const feed = parser.parseURL("https://www.mi5.gov.uk/UKThreatLevel/UKThreatLevel.xml");
        return feed;
    });
}
router.get("/api/v1/ntas/uk", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = yield getDataFromMI5();
    const threatLevel = data.items[0];
    res.status(200).json({
        threat_level: threatLevel["title"],
        description: (_a = threatLevel["content"]) === null || _a === void 0 ? void 0 : _a.split('.')[0],
        contacts: {
            email: "None Provided - Please use the reporting link",
            phone: {
                "Anti-Terrorist Hotline": "0800 789 321",
                "Emergency Services": "999",
                "National Security Concerns": "0800 111 4645",
                "National Security Concerns (Toll)": "+44 (0)20 7930 9000"
            },
            reporting_link: "https://www.mi5.gov.uk/contact-us/contact-form",
            address: "The Enquiries Desk, PO Box 3255, London SW1P 1AE"
        },
        guidelines: [
            "https://www.mi5.gov.uk/threats-and-advice/resources-and-links"
        ],
        news: [
            "https://www.mi5.gov.uk/news"
        ]
    });
}));
router.get("/api/v1/ntas/ireland", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = yield getDataFromMI5();
    const threatLevel = data.items[0];
    res.status(200).json({
        threat_level: threatLevel["title"],
        description: (_a = threatLevel["content"]) === null || _a === void 0 ? void 0 : _a.split('.')[1].trim(),
        contacts: {
            email: "None Provided - Please use the reporting link",
            phone: {
                "Anti-Terrorist Hotline": "0800 789 321",
                "Emergency Services": "999",
                "National Security Concerns": "0800 111 4645",
                "National Security Concerns (Toll)": "+44 (0)20 7930 9000"
            },
            reporting_link: "https://www.mi5.gov.uk/contact-us/contact-form",
            address: "The Enquiries Desk, PO Box 3255, London SW1P 1AE"
        },
        guidelines: [
            "https://www.mi5.gov.uk/threats-and-advice/resources-and-links"
        ],
        news: [
            "https://www.mi5.gov.uk/news"
        ],
        note: "Until an official source for Republic of Ireland is disclosed, all of Ireland will be reported under the MI5.\n\nIf you know of any official sources, please email cicwe@ashleyxir.xyz with the details. \nThank you for your patience."
    });
}));
exports.default = router;
