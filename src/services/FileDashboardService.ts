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
    return new Promise((resolve, reject) => {
      Logger.debug(`getSecrets: ${this.baseDir}`);
      try {
        const dateDirs = fs.readdirSync(this.baseDir);
        const secrets = [];
        for (let i = 0; i < dateDirs.length; i += 1) {
          const dateDir = dateDirs[i];
          if (
            fs.lstatSync(path.join(this.baseDir, dateDir)).isDirectory() &&
            String(dateDir).match(/\d{4}-\d{2}-\d{2}/) !== null
          ) {
            Logger.debug(
              `fileDashboardService - getSecrets - dateDir ${dateDir}`
            );
            const idDirs = fs.readdirSync(path.join(this.baseDir, dateDir));
            for (let j = 0; j < idDirs.length; j += 1) {
              const idDir = idDirs[j];
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
            }
          }
        }
        resolve(secrets);
      } catch (e) {
        reject(e);
      }
    });
  };
}
