import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AController } from "./AController";
import { IVaultService } from "../services/IVaultService";
import Logger from "../utils/logger";
import csv from "csvtojson";
import { ProtectedValue } from "kdbxweb";
import BadParameters from "../domain/errors/BadParameters";

export class VaultController extends AController {
  vaultService: IVaultService;
  constructor(vaultService: IVaultService) {
    super();
    this.vaultService = vaultService;
  }
  home = (req: Request, res: Response): void => {
    res.render("pages/createKeepass");
  };

  createVault = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new BadParameters();
      }
      let jsonObj;
      const password = req.body.password;
      const projectName = req.body.projectName;

      if (req.body.csv) {
        const csvdata = unescape(
          Buffer.from(req.body.csv, "base64").toString()
        );
        jsonObj = await csv({
          delimiter: ["\t"],
          ignoreEmpty: true,
        })
          .on("header", (header) => {
            const dupHeader = header.filter(
              (item: string, index: number) => header.indexOf(item) !== index
            );
            for (let i = 0; i < dupHeader.length; i++) {
              let inc = 1;
              while (header.indexOf(dupHeader[i]) !== -1) {
                header[header.indexOf(dupHeader[i])] = dupHeader[i] + inc++;
              }
            }
          })
          .fromString(csvdata);
      } else if (req.body.data) {
        jsonObj = req.body.data;
      }
      if (!jsonObj) {
        throw new BadParameters();
      }
      const db = await this.vaultService.createVault(
        jsonObj,
        ProtectedValue.fromString(password),
        projectName ? projectName : "new vault"
      );
      const arrayBuff = await db.save();
      res.contentType("application/octet-stream");
      res.shouldKeepAlive = true;
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Keep-alive", "timeout=5");
      res.setHeader("Accept-Ranges", "bytes");

      // res.setHeader("Transfer-Encoding", "chunked");
      res.status(201).send(Buffer.from(arrayBuff));
    } catch (err) {
      Logger.error(err.stack);
      AController.processErrors(err, res);
    }
  };
}
