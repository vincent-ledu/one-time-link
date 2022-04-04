import { Request, Response } from "express";
import { IVaultService } from "../services/IVaultService";
import { AController } from "./AController";
import { validationResult } from "express-validator";
import generator from "generate-password";
import Logger from "../utils/logger";
import csv from "csvtojson";
import { ProtectedValue } from "kdbxweb";

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
        throw errors;
      }
      let jsonObj;
      if (req.headers["content-type"] === "application/json") {
        jsonObj = req.body;
      } else if (req.body) {
        jsonObj = await csv({
          delimiter: ["\t"],
        }).fromString(req.body.csv);
      }
      if (!jsonObj) {
        res.status(400);
        return;
      }
      const pwd = generator.generate({
        length: 20,
        numbers: true,
        symbols: true,
        strict: true,
      });
      const db = await this.vaultService.createVault(
        jsonObj,
        ProtectedValue.fromString(pwd),
        req.body.name ? req.body.name : "new vault"
      );
      res.contentType("application/x-keepass");
      // res.set("Content-disposition", "attachment; filename=coffre.kdbx");
      const arrayBuff = await db.save();
      res.status(201).send(Buffer.from(arrayBuff));
    } catch (err) {
      Logger.error(err);
      res.status(500).send("Error while creating the stuff... sorry...");
    }
  };
}
