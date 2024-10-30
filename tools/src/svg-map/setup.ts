import fs from "fs";
import { findShapeFile } from "./fileUtils.js";

const dir = "src/svg-map";
const inDir = `${dir}/${process.env.IN_DIR}`;
const outDir = `${dir}/${process.env.OUT_DIR}`;

if (!fs.existsSync(inDir)) fs.mkdirSync(inDir);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

export const outMapCountries = `${outDir}/${process.env.MAP_COUNTRIES_FILENAME}`;
export const outCountryFeatures = `${outDir}/${process.env.COUNTRY_FEATURES_FILENAME}`;
export const outMapContinents = `${outDir}/${process.env.MAP_CONTINENTS_FILENAME}`;
export const outContinentFeatures = `${outDir}/${process.env.CONTINENT_FEATURES_FILENAME}`;

export const clip = "-clip bbox=-180,-85,180,85 remove-slivers";
export const proj = "-proj EPSG:3857";
export const shapeFile = await findShapeFile(inDir);
