import chalk from "chalk";

import { runCommand } from "./commandUtils.js";
import { reportFileSize } from "./fileUtils.js";
import {
  jsonContinentsFilename,
  jsonCountriesFilename,
  geoJsonRectanglesFilename,
  svgRectanglesFilename,
  shapeFile,
  svgContinentsFilename,
  svgCountriesFilename,
} from "./setup.js";
import { handleError, timeStamp } from "./utils.js";

if (!shapeFile) {
  console.error("A shape file is required.");
  process.exit(1);
}

console.log(chalk.green("Found shape file:"), shapeFile);

/**
 * Command that:
 * - Explodes, simplifies, cleans, sorts, dissolves, projects and outputs the countries as GeoJSON
 * - Colors the countries and outputs them as SVG
 */
const countriesCmd = `mapshaper "${shapeFile}"
                      -explode
                      -clip bbox2=-180,-85,180,85 remove-slivers
                      -simplify weighted keep-shapes 10%
                      -clean
                      -sort 'GU_A3'
                      -dissolve GEOUNIT copy-fields=SOVEREIGNT,SOV_A3,ADM0_DIF,ADMIN,ADM0_A3,GEOU_DIF,GEOUNIT,GU_A3,MAPCOLOR7,CONTINENT,SUBREGION,MIN_ZOOM,MIN_LABEL,MAX_LABEL,scalerank,LABEL_X,LABEL_Y,WIKIDATAID,ISO_A2_EH
                      -proj EPSG:3857
                      -o ${jsonCountriesFilename} format=json
                      
                      -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
                      -style fill="calcFill(MAPCOLOR7)" stroke="white" opacity=0.25
                      -o ${svgCountriesFilename} id-field=GU_A3 format=svg
                      `.replace(/\s{2,}/g, " ");

/**
 * Command that:
 * - Generates the country map and clips it to the standard bounding box for all following steps
 * - Generates the continents map and outputs the continents
 * - Generates the continent boundaries and outputs both as SVG and GeoJSON data
 * - Simplifies the continents map and outputs the simplified map as SVG
 */
const continentsCmd = `mapshaper "${shapeFile}"
                      -clip bbox2=-180,-85,180,85

                      -dissolve CONTINENT calc="LABEL_X = average(LABEL_X), LABEL_Y = average(LABEL_Y)" + name="continents"
                      -target "continents"
                      -o ${jsonContinentsFilename} format=json

                      -target 1
                      -filter "GU_A3 != 'RUS'" + name="filtered_countries"
                      -filter-islands min-vertices=50
                      -dissolve CONTINENT target="filtered_countries"
                      -rectangles + name="continent_boundaries"
                      -target "continent_boundaries"
                      -snap precision=0.01
                      -proj EPSG:3857
                      -o ${geoJsonRectanglesFilename} format=geojson
                      -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
                      -style fill="calcFill(this.id)" stroke="white" opacity=0.25
                      -o ${svgRectanglesFilename} format=svg id-field=CONTINENT

                      -target "continents"
                      -snap precision=0.01
                      -simplify weighted 3%
                      -clean
                      -proj EPSG:3857
                      -colorizer random name=calcFill colors="#1f77b4,#ff7f0e,#2ca02c,#d62728,#9467bd,#8c564b,#e377c2" categories=0,1,2,3,4,5,6
                      -style fill="calcFill(this.id)" stroke="white" opacity=0.25
                      -o ${svgContinentsFilename} id-field=CONTINENT bbox-index format=svg
                      `.replace(/\s{2,}/g, " ");

async function processMaps() {
  const countriesMap = runCommand(countriesCmd, "Generating country map")
    .then((onFulfilled) => {
      console.log(chalk.blueBright(onFulfilled?.stdout || onFulfilled?.stderr || "No map generated."));
    })
    .then(() => {
      console.log("Country map files:");
      reportFileSize(svgCountriesFilename);
      reportFileSize(jsonCountriesFilename);
    })
    .catch((error) => handleError(error, "map generation"));

  const continentsMap = runCommand(continentsCmd, "Generating continent map")
    .then((onFulfilled) => {
      console.log(chalk.blueBright(onFulfilled?.stdout || onFulfilled?.stderr || "No map generated."));
    })
    .then(() => {
      console.log("Continent map files:");
      reportFileSize(svgContinentsFilename);
      reportFileSize(jsonContinentsFilename);
    })
    .catch((error) => handleError(error, "map generation"));

  try {
    await Promise.all([countriesMap, continentsMap]);
    console.log(chalk.green(`\nDone in ${timeStamp()}`));
  } catch (error) {
    handleError(error, "map generation");
  }
}

processMaps();
