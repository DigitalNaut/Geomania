import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs";

import { inquirer, timeStamp } from "./utils.js";

export function getFileSizeKb(filePath: string) {
  const stat = fs.statSync(filePath, { throwIfNoEntry: false });
  return (stat?.size ?? 0) / 1024;
}

function measureFileSize(path: string) {
  const fileName = path.split("/").pop();
  const size = getFileSizeKb(path);

  return {
    fileName,
    size: `${size.toFixed(2)} KB`,
    time: timeStamp(),
  };
}

export function reportFileSize(filePath: string) {
  const fileSize = measureFileSize(filePath);

  console.table(fileSize);
}

function getFileList(dir: string) {
  return execSync(`dir /b/o/s "${dir}/"`).toString(`utf-8`).split(/\r?\n/);
}

function getLocalShapeFile(dir: string) {
  try {
    const files = getFileList(dir);
    const shapeFile = files.find((fn) => fn.endsWith(".shp"));
    return shapeFile;
  } catch (error) {
    console.error(error);
  }
}

const refererUrl = process.env.REFERER_URL;
const fileDownloadUrl = `${refererUrl}/${process.env.FILE_DOWNLOAD_URL}`;

function downloadShapeFileSync(dir: string) {
  return execSync(
    `cd "${dir}" && curl -o archive.zip -L -e ${refererUrl} ${fileDownloadUrl} && unzip -o archive.zip && rm archive.zip && cd ..`,
  );
}

/**
 * Find the shape file in the given directory.
 * If not found, ask the user if they want to download it.
 * @param dir
 * @returns
 */
export async function findShapeFile(dir: string) {
  let shapeFile = getLocalShapeFile(dir);

  if (!shapeFile) {
    try {
      const response = await inquirer("\nShape file not found. Do you want to download it? (y/yes) ");
      const shouldDownloadFile = ["y", "yes"].includes(response);

      if (!shouldDownloadFile) return;

      const fileName = fileDownloadUrl.split("/").pop();
      console.log(chalk.yellow(`Downloading shape file ${fileName} ...`));

      downloadShapeFileSync(dir);
      shapeFile = getLocalShapeFile(dir);
    } catch (error) {
      console.error(error);
    }
  }

  return shapeFile;
}
