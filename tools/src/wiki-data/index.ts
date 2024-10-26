import axios from "axios";

import data from "../../../src/assets/data/features/countries.json" with { type: "json" };

const [{ WIKIDATAID }] = data;

const info = await axios.get(`https://www.wikidata.org/wiki/Special:EntityData/${WIKIDATAID}.json`);

console.log(info.data);
