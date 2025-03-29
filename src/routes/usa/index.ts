import { Router } from "express";

const router = Router();

router.get("/api/v1/ntas/usa", (req, res) => {
    // TODO: Create a function to pull data from: https://www.dhs.gov/ntas-api-documentation
    res.status(200).json({
        threat_level: "No Current Threats",
        threat_no: "0",
        description: "There are no current advisories.",
        contacts: {
            emails: [
                "SeeSay@hq.dhs.gov",
                "tips.fbi.gov"
            ],
            phone: {
                "Federal Beauru of Intelligence": "1-800-CALL-FBI (1-800-225-5324)",
                "Central Intelligence Agency": "(703) 613-1287",
                "Office of Public Affairs": "(703) 482-0623",
                "National Security TTY Hotline": "1800 234 889",
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