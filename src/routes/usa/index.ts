import { Router } from "express";

const router = Router();

router.get("/api/v1/ntas/usa", (req, res) => {
    res.status(200).json({
        threat_level: "",
        threat_no: "",
        description: "",
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
})

export default router;