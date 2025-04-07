import axios from "axios";
import { Router } from "express";

const router = Router();

router.get("/api/v1/ntas/aus/vic", async (req, res) => {
    const source = await axios.get("https://www.police.vic.gov.au/api/tide/app-search/content-vicpol-vic-gov-au-production/elasticsearch/_search");
    const parsed = JSON.parse(JSON.stringify(source.data));
    
    console.log(parsed.hits.hits[0]["_source"].field_topic_name);
    const data = parsed.hits.hits;

    // DTO : [{
    //     "date": string,
    //     "title": string,
    //     "type": string,
    //     "description": string
    // }];
    const output: any[] = []

    for (let i = 0; i < data.length; i++) {
        console.log(data[i]["_source"].field_topic_name);
        if (data[i]["_source"].field_topic_name === undefined) {
            continue; // For some reason VicPol doesn't define them all
        }
        if (data[i]["_source"].field_topic_name[0] === "Careers" || data[i]["_source"].field_topic_name[0] === "Contact Us") {
            // We can ignore these ones as they don't contain case information
            // and are just verbose pages for Victoria Police
            continue; 
        }
        output.push({
            date: data[i]["_source"].changed[0] as string,
            title: data[i]["_source"].title[0] as string,
            type: data[i]["_source"].field_topic_name as string,
            description: data[i]["_source"].field_paragraph_body[0] as string
        });
    }

    res.status(200).json(
        output
    );
});

router.get("/api/v1/ntas/aus/tas", async (req, res) => {
    res.status(200).json({})
});

router.get("/api/v1/ntas/aus/syd", async (req, res) => {
    res.status(200).json({})
});

router.get("/api/v1/ntas/aus/qld", async (req, res) => {
    res.status(200).json({})
});

router.get("/api/v1/ntas/aus/wa", async (req, res) => {
    res.status(200).json({})
});

router.get("/api/v1/ntas/aus/nt", async (req, res) => {
    res.status(200).json({})
});

export default router;