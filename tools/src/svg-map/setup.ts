import fs from "fs";

import { findShapeFile } from "./fileUtils.js";

const dir = "src/svg-map";
const inDir = `${dir}/${process.env.IN_DIR}`;
const outDir = `${dir}/${process.env.OUT_DIR}`;

if (!fs.existsSync(inDir)) fs.mkdirSync(inDir);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

export const svgCountriesFilename = `${outDir}/${process.env.COUNTRIES_SVG_MAP_FILENAME}`;
export const jsonCountriesFilename = `${outDir}/${process.env.COUNTRY_FEATURES_FILENAME}`;
export const svgContinentsFilename = `${outDir}/${process.env.CONTINENTS_SVG_MAP_FILENAME}`;
export const jsonContinentsFilename = `${outDir}/${process.env.CONTINENT_FEATURES_FILENAME}`;
export const geoJsonRectanglesFilename = `${outDir}/${process.env.CONTINENT_GEOJSON_BOUNDS_FILENAME}`;
export const svgRectanglesFilename = `${outDir}/${process.env.CONTINENT_SVG_BOUNDS_FILENAME}`;

export const shapeFile = await findShapeFile(inDir);
