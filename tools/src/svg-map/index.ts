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

const transposeFeatures = fs.readFileSync(path.join(__dirname, "scripts/transpose-features.js"), "utf-8");
const transposeLabels = fs.readFileSync(path.join(__dirname, "scripts/transpose-labels.js"), "utf-8");

/**
 * Command that:
 * - Explodes, simplifies, cleans, sorts, dissolves, projects and outputs the countries as GeoJSON
 * - Colors the countries and outputs them as SVG
 */
const countriesCmd = `\
  mapshaper "${shapeFile}"
    -clip bbox2=-180,-85,180,85
    -explode

    -simplify weighted keep-shapes 10%
    -proj EPSG:3857 target=*

    -each expression="${transposeFeatures}"

    -dissolve GEOUNIT copy-fields=SOVEREIGNT,SOV_A3,ADM0_DIF,ADMIN,ADM0_A3,GEOU_DIF,GEOUNIT,GU_A3,MAPCOLOR7,CONTINENT,SUBREGION,MIN_ZOOM,MIN_LABEL,MAX_LABEL,scalerank,LABEL_X,LABEL_Y,WIKIDATAID,ISO_A2_EH

    -each expression="${transposeLabels}"

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

    -filter "GU_A3 != 'RUS' && GU_A3 != 'CAN' && GU_A3 != 'GRL'" + name="filtered_countries"
    -target "filtered_countries"
    -filter-islands min-vertices=25
    -dissolve SUBREGION calc="LABEL_X = round(average(LABEL_X), 2), LABEL_Y = round(average(LABEL_Y), 2)" + name="subregions"
    -rectangles target="subregions" + name="subregion_bounds"
    -target "subregion_bounds"
    -snap precision=0.01
    -each "BBOX = this.bbox"
    -o ${subregionFeaturesFilename} format=json precision=0.01

    -proj EPSG:3857
    -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
    -style fill="calcFill(this.id)" stroke="white" opacity=0.25
    -o ${subregionBoundsFilename} format=svg id-field=SUBREGION

    -dissolve SUBREGION target=1 + name="subregions"
    -target "subregions"
    -simplify weighted keep-shapes 10%
    -clean
    -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
    -style fill="calcFill(this.id)" stroke="white" opacity=0.25
    -proj EPSG:3857
    -o ${subregionsMapFilename} id-field=SUBREGION format=svg
  `.replace(/\s{2,}/g, " ");

/**
 * Command that:
 * - Generates the country map and clips it to the standard bounding box for all following steps
 * - Generates the continents map and outputs the continents
 * - Generates the continent boundaries and outputs both as SVG and GeoJSON data
 * - Simplifies the continents map and outputs the simplified map as SVG
 */
const continentsCmd = `\
  mapshaper "${shapeFile}"
    -clip bbox2=-180,-85,180,85
    -filter-islands min-vertices=50

    -filter "GU_A3 != 'RUS' && GU_A3 != 'CAN' && GU_A3 != 'GRL'" + name="filtered_countries"
    -dissolve CONTINENT target="filtered_countries" calc="LABEL_X = round(average(LABEL_X), 2), LABEL_Y = round(average(LABEL_Y), 2)" + name="pruned_continents"
    -rectangles target="pruned_continents" + name="continent_bounds"
    -target "continent_bounds"
    -snap precision=0.01
    -each "BBOX = this.bbox"
    -o ${continentFeaturesFilename} format=json

    -proj EPSG:3857
    -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
    -style fill="calcFill(this.id)" stroke="white" opacity=0.25
    -o ${continentBoundsFilename} format=svg id-field=CONTINENT

    -dissolve CONTINENT target=1 + name="continents"
    -target "continents"
    -simplify weighted 3%
    -clean
    -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
    -style fill="calcFill(this.id)" stroke="white" opacity=0.25
    -proj EPSG:3857
    -o ${continentsMapFilename} id-field=CONTINENT format=svg
  `.replace(/\s{2,}/g, " ");

async function processMaps() {
  let outputFiles: ReturnType<typeof measureFileSize>[] = [];

  const continentsMap = runCommand(continentsCmd, "Generating continent map")
    .then((result) => {
      console.log(chalk.blueBright(result?.stdout || result?.stderr || "No map generated."));
    })
    .then(() => {
      console.log("Continent map files:");
      outputFiles.push(measureFileSize(continentsMapFilename));
      outputFiles.push(measureFileSize(continentFeaturesFilename));
    })
    .catch((error) => handleError(error, "map generation"));

  const subregionsMap = runCommand(subregionsCmd, "Generating subregion map")
    .then((result) => {
      console.log(chalk.blueBright(result?.stdout || result?.stderr || "No map generated."));
    })
    .then(() => {
      console.log("Subregion map files:");
      outputFiles.push(measureFileSize(subregionsMapFilename));
      outputFiles.push(measureFileSize(subregionFeaturesFilename));
    })
    .catch((error) => handleError(error, "map generation"));

  const countriesMap = runCommand(countriesCmd, "Generating country map")
    .then((result) => {
      console.log(chalk.blueBright(result?.stdout || result?.stderr || "No map generated."));
    })
    .then(() => {
      console.log("Country map files:");
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
