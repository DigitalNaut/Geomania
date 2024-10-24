import chalk from "chalk";
import { runCommand } from "./commandUtils.js";
import { reportFileSize } from "./fileUtils.js";
import { handleError, timeStamp } from "./utils.js";
import { clip, outContinentFeatures, outCountryFeatures, outMapContinents, outMapCountries, proj, shapeFile } from "./setup.js";

if (!shapeFile) {
  console.error("A shape file is required.");
  process.exit(1);
}

console.log(chalk.green("Found shape file:"), shapeFile);

const countriesCmd = `mapshaper ${shapeFile} ${clip} -explode -simplify weighted keep-shapes 10% -clean ${proj} -dissolve GEOUNIT copy-fields=SOVEREIGNT,SOV_A3,ADM0_DIF,ADMIN,ADM0_A3,GEOU_DIF,GEOUNIT,GU_A3,MAPCOLOR7,CONTINENT,SUBREGION,MIN_ZOOM,MIN_LABEL,MAX_LABEL,scalerank,LABEL_X,LABEL_Y,WIKIDATAID,ISO_A2_EH -sort 'SOVEREIGNT' -o ${outCountryFeatures} format=json -o ${outMapCountries} id-field=GU_A3 format=svg`;
const continentsCmd = `mapshaper ${shapeFile} ${clip} -explode -simplify weighted 3% -clean ${proj} -dissolve CONTINENT -o ${outContinentFeatures} format=json -o ${outMapContinents} id-field=CONTINENT format=svg`;

async function processMaps() {
  const countriesMap = runCommand(countriesCmd, "Generating country map")
    .then(() => reportFileSize(outMapCountries))
    .then(() => reportFileSize(outCountryFeatures));

  const continentsMap = runCommand(continentsCmd, "Generating continent map")
    .then(() => reportFileSize(outMapContinents))
    .then(() => reportFileSize(outContinentFeatures));

  console.log(chalk.blue("\nOutput files:"));

  try {
    await Promise.all([countriesMap, continentsMap]);
    console.log(chalk.green(`\nDone in ${timeStamp()}`));
  } catch (error) {
    handleError(error, "map generation");
  }
}

processMaps();
