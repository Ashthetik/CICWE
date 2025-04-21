import axios from "axios";
import fetch from "node-fetch";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import * as Cheerio from "cheerio";
import { Router } from "express";
import { NTAS_STATE_DTO } from "../../utility/dto";

const router: Router = Router();

router.get("/api/v1/ntas/aus/vic", async (req, res) => {
    const source = await axios.get("https://www.police.vic.gov.au/api/tide/app-search/content-vicpol-vic-gov-au-production/elasticsearch/_search");
    const parsed = JSON.parse(JSON.stringify(source.data));
    const data = parsed.hits.hits;
    const response: NTAS_STATE_DTO[] = [];

    for (let i = 0; i < data.length; i++) {
        if (data[i]["_source"].field_topic_name === undefined) {
            continue; // For some reason VicPol doesn't define them all
        }
        if (data[i]["_source"].field_topic_name[0] === "Careers" || data[i]["_source"].field_topic_name[0] === "Contact Us") {
            // We can ignore these ones as they don't contain case information
            // and are just verbose pages for Victoria Police
            continue; 
        }

        response.push({
            date: data[i]["_source"].changed[0] as string,
            title: data[i]["_source"].title[0] as string,
            type: data[i]["_source"].field_topic_name as string,
            description: data[i]["_source"].field_paragraph_body[0] as string
        });
    }

    res.status(200).json(response);
});

router.get("/api/v1/ntas/aus/tas", async (req, res) => {
    const source = await axios.get("https://police.tas.gov.au/feed/");
    const validator = XMLValidator.validate(source.data);
    let output;

    if (validator !== true) {
        res.status(502).json({
            error: "Received an invalid response from a source server"
        });
    } else {
        const Parser = new XMLParser();
        output = (Parser.parse(source.data)).rss.channel.item;
    }

    const response: NTAS_STATE_DTO[] = []
    for (let i = 0; i < output.length; i++) {
        response.push({
            date: output[i].pubDate,
            title: output[i].title,
            type: "Unspecified", // TASPD don't specify this for some reason
            description: output[i].description
        });
    }

    res.status(200).json(response);
});

router.get("/api/v1/ntas/aus/syd", async (req, res) => {
    const source = (
        await Cheerio.fromURL("https://www.police.nsw.gov.au/news")
    ).html();
    const $ = Cheerio.load(source);
    const list = $("ul").contents().text().split("\n\t");
    const response: NTAS_STATE_DTO[] = [];

    for (let i = 0; i < list.length; i++) {
        if (list[i] === "\n") {
            continue; // ignore it 
        }

        let temp = list[i].split(" - ");

        try {
            if (temp[0].includes("Skip to content")) {
                continue; //ignore this
            }
            if (temp[1].split(", ")[0].includes("131 444")) {
                continue; // Ignore this
            }
            
            response.push({
                date: temp[1].split(", ")[1].trim(),
                title: temp[0],
                type: "Unspecified",
                description: "Unspecified"
            });
        } catch (e) {
            // We may have accidentally pulled unwanted data
            continue;
        }
    }

    res.status(200).json(response);
});

router.get("/api/v1/ntas/aus/qld", async (req, res) => {
    const source = await axios.get("https://mypolice.qld.gov.au/feed/");
    const validator = XMLValidator.validate(source.data);
    let output;

    if (validator !== true) {
        res.status(502).json({
            error: "Received an invalid response from a source server"
        });
    } else {
        const Parser = new XMLParser();
        output = (Parser.parse(source.data)).rss.channel.item;
    }

    const response: NTAS_STATE_DTO[] = [];
    for (let i = 0; i < output.length; i++) {
        response.push({
            date: output[i].pubDate,
            title: output[i].title,
            type: "Unspecified", // QLDPD don't specify this for some reason
            description: output[i].description
        });
    }

    res.status(200).json(response);
});

router.get("/api/v1/ntas/aus/wa", async (req, res) => {
    const source = await fetch('https://wa-gov-au-syd-v8-prd.es.ap-southeast-2.aws.found.io/_msearch?ignore_unavailable=true', {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'accept-language': 'en-AU,en-GB;q=0.9,en;q=0.8,en-US;q=0.7',
            'authorization': 'Basic Y2xpZW50OjQzNjc0YzY1NDY1MDAw',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'dnt': '1',
            'origin': 'https://www.wa.gov.au',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'sec-ch-ua': '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'sec-gpc': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0'
        },
        body: '{"index":"production-wagov-green-pipeline-cms-search-alias"}\n{"aggs":{"field_category_of_publication":{"terms":{"field":"field_category_of_publication","size":300}},"field_provider_title":{"terms":{"field":"field_provider_title","size":300}},"field_topic":{"terms":{"field":"field_topic","size":300}},"field_topical_event_title":{"terms":{"field":"field_topical_event_title","size":300}}},"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"field_provider_title":"Western Australia Police Force"}}]}},{"bool":{"must":{"term":{"content_type":{"value":"announcement_content"}}}}}],"must":{"match_all":{}}}},"size":8,"from":0,"_source":{"includes":["changed","content_type","field_description","field_position_portfolios","field_provider_title","field_provider_url","field_published_date","field_service_intention","field_subtitle","revision_timestamp","title","url"]},"highlight":{"pre_tags":["<em>"],"post_tags":["</em>"],"fields":{"title":{"number_of_fragments":0},"field_description":{"number_of_fragments":0},"field_position_portfolios":{"number_of_fragments":0},"field_subtitle":{"number_of_fragments":0},"rendered_item":{"number_of_fragments":1,"fragment_size":250}}},"sort":[{"_score":"desc"},{"published":"desc"},{"title.keyword":"asc"}]}\n{"index":"production-wagov-green-pipeline-cms-search-alias"}\n{"aggs":{"field_provider_title":{"terms":{"field":"field_provider_title","size":300}}},"query":{"bool":{"filter":[{"bool":{"must":{"term":{"content_type":{"value":"announcement_content"}}}}}],"must":{"match_all":{}}}},"size":0,"from":0,"_source":{"includes":["changed","content_type","field_description","field_position_portfolios","field_provider_title","field_provider_url","field_published_date","field_service_intention","field_subtitle","revision_timestamp","title","url"]},"highlight":{"pre_tags":["<em>"],"post_tags":["</em>"],"fields":{"title":{"number_of_fragments":0},"field_description":{"number_of_fragments":0},"field_position_portfolios":{"number_of_fragments":0},"field_subtitle":{"number_of_fragments":0},"rendered_item":{"number_of_fragments":1,"fragment_size":250}}},"sort":[{"_score":"desc"},{"published":"desc"},{"title.keyword":"asc"}]}\n'
    });
    
    const parsed = JSON.parse(JSON.stringify(await source.json()));
    const data = parsed.responses[0].hits.hits;
    const response: NTAS_STATE_DTO[] = [];

    for (let i = 0; i < data.length; i++) {
        response.push({
            date: new Date(data[i]["_source"].changed[0] * 1000).toISOString(),
            title: data[i]["_source"].title[0] as string,
            type: data[i]["_source"].field_service_intention[0] as string,
            description: `Details can be found at: https://wa.gov.au${data[i]["_source"].url[0]}`
        });
    }

    res.status(200).json(response);
});

router.get("/api/v1/ntas/aus/nt", async (req, res) => {
    const source = await axios.get("https://pfes.nt.gov.au/news.rss");
    const validator = XMLValidator.validate(source.data);
    let output;

    if (validator !== true) {
        res.status(502).json({
            error: "Received an invalid response from a source server"
        });
    } else {
        const Parser = new XMLParser();
        output = (Parser.parse(source.data)).rss.channel.item;
    }

    const response: NTAS_STATE_DTO[] = [];
    for (let i = 0; i < output.length; i++) {
        response.push(
            {
                date: output[i].pubDate as string,
                title: output[i].title as string,
                type: "Unspecified", // NTPD don't specify this for some reason
                description: output[i].description as string
            }
        )
    }

    res.status(200).json(response);
});

export default router;
