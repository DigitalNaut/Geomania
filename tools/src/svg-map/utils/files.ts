import { execSync } from "child_process";
import fs from "fs";
import path from "path";

import { timeStamp } from "../utils.js";

function bytesToKb(bytes: number | undefined) {
  return (bytes ?? 0) / 1024;
}

function getFileSize(filePath: string) {
  const stat = fs.statSync(filePath, { throwIfNoEntry: false });
  return stat?.size;
}

export function measureFileSize(filePath: string) {
  const fileName = path.basename(filePath);
  const bytes = getFileSize(filePath);
  const size = bytesToKb(bytes);

  return {
    fileName,
    size,
    time: timeStamp(),
  };
}

export function getFileList(dir: string) {
  return execSync(`dir /b/o/s "${dir}/"`).toString(`utf-8`).split(/\r?\n/);
}
