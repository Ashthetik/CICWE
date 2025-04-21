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
const axios_1 = __importDefault(require("axios"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fast_xml_parser_1 = require("fast-xml-parser");
const Cheerio = __importStar(require("cheerio"));
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/api/v1/ntas/aus/vic", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const source = yield axios_1.default.get("https://www.police.vic.gov.au/api/tide/app-search/content-vicpol-vic-gov-au-production/elasticsearch/_search");
    const parsed = JSON.parse(JSON.stringify(source.data));
    const data = parsed.hits.hits;
    // DTO : [{
    //     "date": string,
    //     "title": string,
    //     "type": string,
    //     "description": string
    // }];
    const output = [];
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
            date: data[i]["_source"].changed[0],
            title: data[i]["_source"].title[0],
            type: data[i]["_source"].field_topic_name,
            description: data[i]["_source"].field_paragraph_body[0]
        });
    }
    res.status(200).json(output);
}));
router.get("/api/v1/ntas/aus/tas", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const source = yield axios_1.default.get("https://police.tas.gov.au/feed/");
    const validator = fast_xml_parser_1.XMLValidator.validate(source.data);
    let output;
    if (validator !== true) {
        res.status(502).json({
            error: "Received an invalid response from a source server"
        });
    }
    else {
        const Parser = new fast_xml_parser_1.XMLParser();
        output = (Parser.parse(source.data)).rss.channel.item;
    }
    /*
    DTO : [{
        "date": string,
        "title": string,
        "type": string,
        "description": string
    }];
    */
    const data = [];
    for (let i = 0; i < output.length; i++) {
        data.push([
            {
                date: output[i].pubDate,
                title: output[i].title,
                type: "Unspecified", // TASPD don't specify this for some reason
                description: output[i].description
            }
        ]);
    }
    res.status(200).json(data);
}));
router.get("/api/v1/ntas/aus/syd", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const source = (yield Cheerio.fromURL("https://www.police.nsw.gov.au/news")).html();
    const $ = Cheerio.load(source);
    const list = $("ul").contents().text().split("\n\t");
    /*
    DTO : [{
        "date": string,
        "title": string,
        "type": string,
        "description": string
    }];
    */
    const data = [];
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
            data.push({
                date: temp[1].split(", ")[1].trim(),
                title: temp[0],
                type: "Unspecified",
                description: "Unspecified"
            });
        }
        catch (e) {
            // We may have accidentally pulled unwanted data
            continue;
        }
    }
    res.status(200).json(data);
}));
router.get("/api/v1/ntas/aus/qld", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const source = yield axios_1.default.get("https://mypolice.qld.gov.au/feed/");
    const validator = fast_xml_parser_1.XMLValidator.validate(source.data);
    let output;
    if (validator !== true) {
        res.status(502).json({
            error: "Received an invalid response from a source server"
        });
    }
    else {
        const Parser = new fast_xml_parser_1.XMLParser();
        output = (Parser.parse(source.data)).rss.channel.item;
    }
    /*
    DTO : [{
        "date": string,
        "title": string,
        "type": string,
        "description": string
    }];
    */
    const data = [];
    for (let i = 0; i < output.length; i++) {
        data.push([
            {
                date: output[i].pubDate,
                title: output[i].title,
                type: "Unspecified", // QLDPD don't specify this for some reason
                description: output[i].description
            }
        ]);
    }
    res.status(200).json(data);
}));
router.get("/api/v1/ntas/aus/wa", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const source = yield (0, node_fetch_1.default)('https://wa-gov-au-syd-v8-prd.es.ap-southeast-2.aws.found.io/_msearch?ignore_unavailable=true', {
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
    /**
     * TODO: Figure out the weird '\n' termination bug
     * await axios.post(
        'https://wa-gov-au-syd-v8-prd.es.ap-southeast-2.aws.found.io/_msearch',
        `{"index":"production-wagov-green-pipeline-cms-search-alias"}\n{"aggs":{"field_category_of_publication":{"terms":{"field":"field_category_of_publication","size":300}},"field_provider_title":{"terms":{"field":"field_provider_title","size":300}},"field_topic":{"terms":{"field":"field_topic","size":300}},"field_topical_event_title":{"terms":{"field":"field_topical_event_title","size":300}}},"query":{"bool":{"filter":[{"bool":{"should":[{"term":{"field_provider_title":"Western Australia Police Force"}}]}},{"bool":{"must":{"term":{"content_type":{"value":"announcement_content"}}}}}],"must":{"match_all":{}}}},"size":8,"from":0,"_source":{"includes":["changed","content_type","field_description","field_position_portfolios","field_provider_title","field_provider_url","field_published_date","field_service_intention","field_subtitle","revision_timestamp","title","url"]},"highlight":{"pre_tags":["<em>"],"post_tags":["</em>"],"fields":{"title":{"number_of_fragments":0},"field_description":{"number_of_fragments":0},"field_position_portfolios":{"number_of_fragments":0},"field_subtitle":{"number_of_fragments":0},"rendered_item":{"number_of_fragments":1,"fragment_size":250}}},"sort":[{"_score":"desc"},{"published":"desc"},{"title.keyword":"asc"}]}\n{"index":"production-wagov-green-pipeline-cms-search-alias"}\n{"aggs":{"field_provider_title":{"terms":{"field":"field_provider_title","size":300}}},"query":{"bool":{"filter":[{"bool":{"must":{"term":{"content_type":{"value":"announcement_content"}}}}}],"must":{"match_all":{}}}},"size":0,"from":0,"_source":{"includes":["changed","content_type","field_description","field_position_portfolios","field_provider_title","field_provider_url","field_published_date","field_service_intention","field_subtitle","revision_timestamp","title","url"]},"highlight":{"pre_tags":["<em>"],"post_tags":["</em>"],"fields":{"title":{"number_of_fragments":0},"field_description":{"number_of_fragments":0},"field_position_portfolios":{"number_of_fragments":0},"field_subtitle":{"number_of_fragments":0},"rendered_item":{"number_of_fragments":1,"fragment_size":250}}},"sort":[{"_score":"desc"},{"published":"desc"},{"title.keyword":"asc"}]}\n`.padEnd(1,"\n"),
        {
            params: {
                'ignore_unavailable': 'true'
            },
            headers: {
                'accept': '',
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
            }
        }
    );
    **/
    const parsed = JSON.parse(JSON.stringify(yield source.json()));
    const data = parsed.responses[0].hits.hits;
    console.log(parsed.responses[1]);
    // DTO : [{
    //     "date": string,
    //     "title": string,
    //     "type": string,
    //     "description": string
    // }];
    const output = [];
    for (let i = 0; i < data.length; i++) {
        console.log(data[i]);
        output.push({
            date: new Date(data[i]["_source"].changed[0] * 1000).toISOString(),
            title: data[i]["_source"].title[0],
            type: data[i]["_source"].field_service_intention[0],
            description: `Details can be found at: https://wa.gov.au${data[i]["_source"].url[0]}`
        });
    }
    res.status(200).json(output);
}));
router.get("/api/v1/ntas/aus/nt", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const source = yield axios_1.default.get("https://pfes.nt.gov.au/news.rss");
    const validator = fast_xml_parser_1.XMLValidator.validate(source.data);
    let output;
    if (validator !== true) {
        res.status(502).json({
            error: "Received an invalid response from a source server"
        });
    }
    else {
        const Parser = new fast_xml_parser_1.XMLParser();
        output = (Parser.parse(source.data)).rss.channel.item;
    }
    /*
    DTO : [{
        "date": string,
        "title": string,
        "type": string,
        "description": string
    }];
    */
    const data = [];
    for (let i = 0; i < output.length; i++) {
        data.push([
            {
                date: output[i].pubDate,
                title: output[i].title,
                type: "Unspecified", // NTPD don't specify this for some reason
                description: output[i].description
            }
        ]);
    }
    res.status(200).json(data);
}));
exports.default = router;
