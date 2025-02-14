import fs from "fs";
import path from "path";

import { findShapeFile } from "./utils/shapefiles.js";

const inDir = path.join(__dirname, process.env.IN_DIR ?? "");
const outDir = path.join(__dirname, process.env.OUT_DIR ?? "");

if (!fs.existsSync(inDir)) fs.mkdirSync(inDir);
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir);

function getFilePath(filename: string | undefined) {
  if (!filename) throw new Error("Missing filename");
  return path.join(outDir, filename);
}

// JSON (GeoJSON) filenames
export const continentFeaturesFilename = getFilePath(process.env.CONTINENT_JSON_FILENAME);
export const subregionFeaturesFilename = getFilePath(process.env.SUBREGION_JSON_FILENAME);
export const countryFeaturesFilename = getFilePath(process.env.COUNTRY_JSON_FILENAME);

// SVG filenames
export const continentsMapFilename = getFilePath(process.env.CONTINENTS_SVG_MAP_FILENAME);
export const subregionsMapFilename = getFilePath(process.env.SUBREGIONS_SVG_MAP_FILENAME);
export const countriesMapFilename = getFilePath(process.env.COUNTRIES_SVG_MAP_FILENAME);
export const continentBoundsFilename = getFilePath(process.env.CONTINENT_SVG_BOUNDS_FILENAME);
export const subregionBoundsFilename = getFilePath(process.env.SUBREGION_SVG_BOUNDS_FILENAME);

export const shapeFile = await findShapeFile(inDir);
