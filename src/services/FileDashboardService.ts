import * as fs from "fs";
import * as path from "path";
import { Secret } from "../domain/Secret";
import Logger from "../utils/logger";
import { IDashboardService } from "./IDashboardService";

export class FileDashboardService implements IDashboardService {
  baseDir: string;
  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }
  getSecrets = async (): Promise<Secret[]> => {
    const secrets: Secret[] | Promise<Secret[]> = [];
    Logger.debug(`getSecrets: ${this.baseDir}`);
    fs.readdir(this.baseDir, (err, dateDirs) => {
      if (err) {
        Logger.error(err);
        throw err;
      }
      dateDirs.forEach((dateDir) => {
        if (
          fs.lstatSync(path.join(this.baseDir, dateDir)).isDirectory() &&
          String(dateDirs).match(/\d{4}-\d{2}-\d{2}/) !== null
        ) {
          Logger.debug(
            `fileDashboardService - getSecrets - dateDir ${dateDir}`
          );
          fs.readdir(path.join(this.baseDir, dateDir), (err, idDirs) => {
            if (err) {
              Logger.error(err);
              throw err;
            }
            idDirs.forEach((idDir) => {
              if (
                fs.lstatSync(path.join(this.baseDir, dateDir, idDir)) &&
                String(idDir).match(
                  /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
                ) !== null
              ) {
                const sec = new Secret(
                  idDir,
                  undefined,
                  undefined,
                  undefined,
                  dateDir
                );
                Logger.debug(`adding ${JSON.stringify(sec)}`);
                secrets.push(sec);
              }
            });
          });
        }
      });
    });
    return secrets;
  };
}
