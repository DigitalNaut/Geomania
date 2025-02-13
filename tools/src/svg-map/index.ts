import chalk from "chalk";
import fs from "fs";
import path from "path";

import { runCommand } from "./commandUtils.js";
import { measureFileSize } from "./fileUtils.js";
import {
  shapeFile,
  continentsMapFilename,
  subregionsMapFilename,
  countriesMapFilename,
  continentBoundsFilename,
  subregionBoundsFilename,
  continentFeaturesFilename,
  subregionFeaturesFilename,
  countryFeaturesFilename,
} from "./setup.js";
import { handleError, timeStamp } from "./utils.js";

if (!shapeFile) {
  console.error("A shape file is required.");
  process.exit(1);
}

console.log(chalk.green("Found shape file:"), shapeFile);

function importScriptText(...paths: string[]) {
  const file = paths.pop();
  return fs.readFileSync(path.join(__dirname, ...paths, `${file}.js`), "utf-8");
}

const transposeFeatures = importScriptText("scripts/transpose", "features");
const transposeLabels = importScriptText("scripts/transpose", "labels");

const countriesCmd = `\
  mapshaper "${shapeFile}"
    -clip bbox2=-180,-85,180,85

    -explode
    -proj EPSG:3857
    -each "${transposeFeatures}"
    -each "${transposeLabels}"

    -dissolve GEOUNIT copy-fields=SOVEREIGNT,SOV_A3,ADM0_DIF,ADMIN,ADM0_A3,GEOU_DIF,GEOUNIT,GU_A3,MAPCOLOR7,CONTINENT,SUBREGION,MIN_ZOOM,MIN_LABEL,MAX_LABEL,scalerank,LABEL_X,LABEL_Y,WIKIDATAID,ISO_A2_EH

    -simplify weighted keep-shapes 10%
    -clean

    -sort 'GU_A3'
    -o ${countryFeaturesFilename} format=json precision=0.01

    -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
    -style fill="calcFill(MAPCOLOR7)" stroke="white" opacity=0.25
    -o ${countriesMapFilename} id-field=GU_A3 format=svg
  `.replace(/\s{2,}/g, " ");

const subregionsCmd = `\
  mapshaper "${shapeFile}"
    -clip bbox2=-180,-85,180,85

    -explode
    -proj EPSG:3857
    -each "${transposeFeatures}"
    -each "${transposeLabels}"

    -filter "GU_A3 != 'RUS' && GU_A3 != 'CAN' && GU_A3 != 'GRL'" + name="filtered_countries"
    -dissolve SUBREGION target="filtered_countries" calc="LABEL_X = round(average(LABEL_X), 2), LABEL_Y = round(average(LABEL_Y), 2)" + name="subregions"
    -rectangles target="subregions" + name="subregion_bounds"
    -target "subregion_bounds"
    -require "../../../../../../tools/src/svg-map/scripts/utils.mjs" alias="utils"
    -each "BBOX = utils.projectBBox('EPSG:3857', 'WGS84', this.bbox, round).map(round)"
    -snap precision=0.01
    -o ${subregionFeaturesFilename} format=json precision=0.01

    -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
    -style fill="calcFill(this.id)" stroke="white" opacity=0.25
    -o ${subregionBoundsFilename} format=svg id-field=SUBREGION

    -drop target="filtered_countries,subregions"

    -dissolve SUBREGION target=1 + name="subregions"
    -target "subregions"
    -simplify weighted keep-shapes 3%
    -filter-islands min-vertices=5
    -clean
    -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
    -style fill="calcFill(this.id)" stroke="white" opacity=0.25
    -o ${subregionsMapFilename} id-field=SUBREGION format=svg
  `.replace(/\s{2,}/g, " ");

const continentsCmd = `\
  mapshaper "${shapeFile}"
    -clip bbox2=-180,-85,180,85

    -explode
    -proj EPSG:3857
    -each "${transposeFeatures}"
    -each "${transposeLabels}"

    -filter "GU_A3 != 'RUS' && GU_A3 != 'CAN' && GU_A3 != 'GRL'" + name="filtered_countries"
    -dissolve CONTINENT target="filtered_countries" calc="LABEL_X = round(average(LABEL_X), 2), LABEL_Y = round(average(LABEL_Y), 2)" + name="pruned_continents"
    -rectangles target="pruned_continents" + name="continent_bounds"
    -target "continent_bounds"
    -require "../../../../../../tools/src/svg-map/scripts/utils.mjs" alias="utils"
    -each "BBOX = utils.projectBBox('EPSG:3857', 'WGS84', this.bbox, round).map(round)"
    -snap precision=0.01
    -o ${continentFeaturesFilename} format=json

    -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
    -style fill="calcFill(this.id)" stroke="white" opacity=0.25
    -o ${continentBoundsFilename} format=svg id-field=CONTINENT

    -drop target="filtered_countries,pruned_continents"

    -dissolve CONTINENT target=1 + name="continents"
    -target "continents"
    -simplify weighted keep-shapes 3%
    -filter-islands min-vertices=15
    -clean
    -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
    -style fill="calcFill(this.id)" stroke="white" opacity=0.25
    -o ${continentsMapFilename} id-field=CONTINENT format=svg
  `.replace(/\s{2,}/g, " ");

async function processMaps() {
  let outputFiles: ReturnType<typeof measureFileSize>[] = [];

  const continentsMap = runCommand(continentsCmd, "Generating continent map")
    .then((result) => {
      console.log("\nContinent map files:");
      console.log(chalk.blueBright(result?.stdout || result?.stderr || "No map generated."));
    })
    .then(() => {
      outputFiles.push(measureFileSize(continentsMapFilename));
      outputFiles.push(measureFileSize(continentFeaturesFilename));
    })
    .catch((error) => handleError(error, "map generation"));

  const subregionsMap = runCommand(subregionsCmd, "Generating subregion map")
    .then((result) => {
      console.log("Subregion map files:");
      console.log(chalk.blueBright(result?.stdout || result?.stderr || "No map generated."));
    })
    .then(() => {
      outputFiles.push(measureFileSize(subregionsMapFilename));
      outputFiles.push(measureFileSize(subregionFeaturesFilename));
    })
    .catch((error) => handleError(error, "map generation"));

  const countriesMap = runCommand(countriesCmd, "Generating country map")
    .then((result) => {
      console.log("Country map files:");
      console.log(chalk.blueBright(result?.stdout || result?.stderr || "No map generated."));
    })
    .then(() => {
      outputFiles.push(measureFileSize(countriesMapFilename));
      outputFiles.push(measureFileSize(countryFeaturesFilename));
    })
    .catch((error) => handleError(error, "map generation"));

  Promise.allSettled([continentsMap, subregionsMap, countriesMap]).then(() => {
    const totalSize = outputFiles.reduce((acc, file) => acc + file.size, 0);
    console.log("\nFiles generated:");
    console.table(outputFiles.map((file) => ({ ...file, size: `${file.size.toFixed(2)} KB` })));
    console.log(`Total size: ${totalSize.toFixed(2)} KB`);
  });

  try {
    await Promise.all([countriesMap, subregionsMap, continentsMap]);
    console.log(chalk.green(`\nDone in ${timeStamp()}`));
  } catch (error) {
    handleError(error, "map generation");
  }
}

processMaps();
