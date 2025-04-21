import { Router } from "express";
import RSS from "rss-parser";
import { NTAS_TERROR_DTO } from "../../utility/dto";

const router: Router = Router();

async function getDataFromMI5() {
    const parser = new RSS();
    const feed = parser.parseURL("https://www.mi5.gov.uk/UKThreatLevel/UKThreatLevel.xml");

    return feed;
};

router.get("/api/v1/ntas/uk", async (req, res) => {
    const data = await getDataFromMI5();

    const threatLevel = data.items[0];

    const response: NTAS_TERROR_DTO = {
        threat_level: threatLevel["title"] as string,
        description: threatLevel["content"]?.split('.')[0] as string,
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
    };

    res.status(200).json(response);
});

router.get("/api/v1/ntas/ireland", async (req, res) => {
    const data = await getDataFromMI5();

    const threatLevel = data.items[0];

    const response: NTAS_TERROR_DTO = {
        threat_level: threatLevel["title"] as string,
        description: threatLevel["content"]?.split('.')[1].trim() as string,
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
        notes:[ 
            "Until an official source for Republic of Ireland is disclosed, all of Ireland will be reported under the MI5.\n\nIf you know of any official sources, please email cicwe@ashleyxir.xyz with the details. \nThank you for your patience."
        ]
    };

    res.status(200).json(response);
});

export default router;
