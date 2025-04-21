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
const fast_xml_parser_1 = require("fast-xml-parser");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
router.get("/api/v1/ntas/usa", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const source = yield axios_1.default.get("https://www.dhs.gov/ntas/1.1/feed.xml");
    const validator = fast_xml_parser_1.XMLValidator.validate(source.data);
    let output;
    if (validator !== true) {
        res.status(502).json({
            error: "Received an invalid response from a source server"
        });
    }
    else {
        const Parser = new fast_xml_parser_1.XMLParser();
        output = Parser.parse(source.data);
    }
    /*
    DTO:
    {
        level: string,
        number: string,
        alerts: string
    }
    */
    const threatDetails = {};
    if (output.alerts.length === 0) {
        threatDetails.level = "No Current Threats",
            threatDetails.number = "Not Assigned";
        threatDetails.alerts = "There are no current advisories";
    }
    else {
        threatDetails.level = output.alerts.alert[0].type;
        threatDetails.number = "High",
            threatDetails.alerts = output.alerts.summary;
    }
    res.status(200).json({
        threat_level: threatDetails.level,
        threat_no: threatDetails.number,
        description: threatDetails.alerts,
        contacts: {
            emails: [
                "SeeSay@hq.dhs.gov",
                "tips.fbi.gov"
            ],
            phone: {
                "Federal Beauru of Intelligence": "1-800-CALL-FBI (1-800-225-5324)",
                "Central Intelligence Agency": "(703) 613-1287",
                "Office of Public Affairs": "(703) 482-0623",
                "Emergency Services": "911"
            },
            reporting_link: "https://www.dhs.gov/see-something-say-something",
            addresses: [
                "Central Intelligence Agency, Office of Public Affairs Washington, DC 20505",
                "Field Offices can be found here: https://www.fbi.gov/contact-us/field-offices",
                "FBI Headquarters, 935 Pennsylvania Avenue, NW Washington, D.C. 20535-0001 (202) 324-3000"
            ],
        },
        guidelines: [
            "https://www.fbi.gov/how-we-can-help-you/scams-and-safety",
            "https://www.cia.gov/resources/",
            "https://www.dhs.gov/see-something-say-something/about-campaign"
        ],
        news: [
            "https://www.fbi.gov/news",
            "https://www.cia.gov/stories/"
        ]
    });
}));
exports.default = router;
