import { Router } from "express";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import axios from "axios";

const router = Router();

router.get("/api/v1/ntas/usa", async (req, res) => {
    const source = await axios.get("https://www.dhs.gov/ntas/1.1/feed.xml");
    const validator = XMLValidator.validate(source.data);
    let output;

    if (validator !== true) {
        res.status(502).json({
            error: "Received an invalid response from a source server"
        });
    } else {
        const Parser = new XMLParser();
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
    const threatDetails: any = {};

    if (output.alerts.length === 0) {
        threatDetails.level = "No Current Threats",
        threatDetails.number = "Not Assigned"
        threatDetails.alerts = "There are no current advisories"
    } else {
        threatDetails.level = output.alerts.alert[0].type
        threatDetails.number = "High",
        threatDetails.alerts = output.alerts.summary
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
})

export default router;