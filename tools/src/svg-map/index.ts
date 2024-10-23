import { exec, execSync } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execPromise = promisify(exec);

const dir = "src/svg-map";
const inDir = `${dir}/in`;
const outDir = `${dir}/out`;

const outMapCountries = `${outDir}/world-map-countries.svg`;
const outCountryFeatures = `${outDir}/features-data.json`;
const outMapContinents = `${outDir}/world-map-continents.svg`;

console.log("\nGenerating maps...");

function findShapeFile() {
  try {
    const files = execSync(`dir /b/o/s "${inDir}/"`).toString(`utf-8`).split(/\r?\n/);
    const shapeFile = files.find((fn) => fn.endsWith(".shp"));
    return shapeFile;
  } catch (error) {
    console.error(error);
    return null;
  }
}

const shapeFile = findShapeFile();

if (shapeFile) {
  console.log(`Using shape file ${shapeFile}\n`);
} else {
  console.error(`No shape file found in ${inDir}, exiting...`);
  process.exit(1);
}

console.log(`Converting ${shapeFile}...`);

function getFileSize(filePath: string) {
  const stat = fs.statSync(filePath, { throwIfNoEntry: false });
  const size = stat?.size ?? 0;
  return size / 1024;
}

const stampTime = (function createTimeStamp() {
  const startTime = performance.now();
  return () => `${(performance.now() - startTime).toFixed(2)} ms`;
})();

function reportFileSize(filePath: string) {
  const fileName = filePath.split(`/`)[filePath.split(`/`).length - 1];
  const size = getFileSize(outMapCountries);

  if (size > 0) console.log(`\t${fileName} (${size.toFixed(2)} KB) (${stampTime()})`);
  else console.error(`\tError: No '${fileName}' found`);
}

const clip = "-clip bbox=-180,-85,180,85 remove-slivers";
const proj = "-proj EPSG:3857";

const countriesCmd = `mapshaper ${shapeFile} ${clip} -explode -simplify weighted keep-shapes 10% -clean ${proj} -dissolve GEOUNIT copy-fields=SOVEREIGNT,SOV_A3,ADM0_DIF,ADMIN,ADM0_A3,GEOU_DIF,GEOUNIT,GU_A3,MAPCOLOR7,CONTINENT,SUBREGION,MIN_ZOOM,MIN_LABEL,MAX_LABEL,scalerank,LABEL_X,LABEL_Y,WIKIDATAID,ISO_A2_EH -sort 'SOVEREIGNT' -o ${outCountryFeatures} format=json -o ${outMapCountries} id-field=GU_A3 format=svg`;
const continentsCmd = `mapshaper ${shapeFile} ${clip} -explode -simplify weighted 3% -clean ${proj} -dissolve CONTINENT -o ${outMapContinents} id-field=CONTINENT format=svg`;

const countriesMap = execPromise(countriesCmd).then(() => {
  reportFileSize(outMapCountries);
  reportFileSize(outCountryFeatures);
});

const continentsMap = execPromise(continentsCmd).then(() => {
  reportFileSize(outMapContinents);
});

try {
  await Promise.all([countriesMap, continentsMap]);

  console.log(`\nDone in ${stampTime()}.`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
