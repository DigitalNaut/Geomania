import chalk from "chalk";

import { runCommand } from "./commandUtils.js";
import { reportFileSize } from "./fileUtils.js";
import {
  jsonContinentsFilename,
  jsonCountriesFilename,
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
const countriesCmd = `mapshaper ${shapeFile}\
                      -explode\
                      -clip bbox2=-180,-85,180,85 remove-slivers\
                      -simplify weighted keep-shapes 10%\
                      -clean\
                      -sort 'GU_A3'\
                      -dissolve GEOUNIT copy-fields=SOVEREIGNT,SOV_A3,ADM0_DIF,ADMIN,ADM0_A3,GEOU_DIF,GEOUNIT,GU_A3,MAPCOLOR7,CONTINENT,SUBREGION,MIN_ZOOM,MIN_LABEL,MAX_LABEL,scalerank,LABEL_X,LABEL_Y,WIKIDATAID,ISO_A2_EH\
                      -proj EPSG:3857\
                      -o ${jsonCountriesFilename} format=json\
                      -o ${svgCountriesFilename} id-field=GU_A3 format=svg`;
const continentsCmd = `mapshaper ${shapeFile}\
                      -clip bbox2=-180,-85,180,85 remove-slivers\
                      -simplify weighted 3%\
                      -clean\
                      -dissolve CONTINENT\
                      -proj EPSG:3857\
                      -o ${jsonContinentsFilename} format=json\
                      -o ${svgContinentsFilename} id-field=CONTINENT bbox-index format=svg`;

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
