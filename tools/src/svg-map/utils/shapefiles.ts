import chalk from "chalk";
import { execSync } from "child_process";

import { inquire } from "./commands.js";
import { getFileList } from "./files.js";

function getLocalShapeFile(dir: string) {
  try {
    const files = getFileList(dir);
    const shapeFile = files.find((fn) => fn.endsWith(".shp"));
    return shapeFile;
  } catch (error) {
    console.error(error);
  }

  return null;
}

const refererUrl = process.env.REFERER_URL;
const fileDownloadUrl = `${refererUrl}/${process.env.FILE_DOWNLOAD_URL}`;

function downloadShapeFileSync(dir: string) {
  return execSync(
    `cd "${dir}" && curl -o archive.zip -L -e ${refererUrl} ${fileDownloadUrl} && unzip -o archive.zip && rm archive.zip && cd ..`,
  );
}

async function getRemoteShapeFile(dir: string) {
  const fileName = fileDownloadUrl.split("/").pop();
  console.log(chalk.yellow(`Downloading shape file ${fileName} ...`));

  downloadShapeFileSync(dir);
  return getLocalShapeFile(dir);
}

async function promptDownloadShapeFile() {
  const response = await inquire("\nShape file not found. Do you want to download it? (y/yes) ");
  const shouldDownloadFile = ["y", "yes"].includes(response);

  return shouldDownloadFile;
}

/**
 * Find the shape file in the given directory.
 * If not found, ask the user if they want to download it.
 * @param dir
 * @returns
 */
export async function findShapeFile(dir: string) {
  let shapeFile = getLocalShapeFile(dir);
  if (shapeFile) return shapeFile;

  const shouldDownloadFile = await promptDownloadShapeFile();
  if (!shouldDownloadFile) return null;

  try {
    shapeFile = await getRemoteShapeFile(dir);
    if (shapeFile) return shapeFile;
  } catch (error) {
    console.error(error);
  }

  return null;
}
