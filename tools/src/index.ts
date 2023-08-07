import fs from "fs/promises";

import data from "../../src/assets/data/country-metadata.json";

const svgFilePath = "../src/assets/images/world-map-mercator.svg";
const svg_needle = /A3="(...)" ADMIN="(.+?)"/g;

async function runAsyncCode() {
  const svgFile = await fs.readFile(svgFilePath, "utf8");

  const svg_a3 = Array.from(svgFile.matchAll(svg_needle)).map((match) => match[1]);
  const svg_admin = Array.from(svgFile.matchAll(svg_needle)).map((match) => match[2]);
  const data_a3 = data.map(({ a3 }) => a3);

  // const inCommon = data.filter(({ a3 }) => svg_a3.includes(a3)).map(({ a3, name }) => [a3, name]);
  const missingInSVG = data.filter(({ a3 }) => !svg_a3.includes(a3)).map(({ a3, name }) => [a3, name]);
  const missingInData = svg_a3.filter((a3) => !data_a3.includes(a3)).map((a3) => [a3, svg_admin[svg_a3.indexOf(a3)]]);

  // console.log(`In common: ${inCommon.length}`);
  // console.log(inCommon);
  // console.log("\n");

  console.log(`Missing in data: ${missingInData.length}`);
  console.log(JSON.stringify(missingInData, null, 2));
  console.log("\n");

  console.log(`Missing in SVG: ${missingInSVG.length}`);
  console.log(JSON.stringify(missingInSVG, null, 2));
}

runAsyncCode();
