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

  generatePassword = (req: Request, res: Response): Promise<void> => {
    const pwd = generator.generate({
      length: req.query.len ? parseInt(req.query.len.toString()) : 20,
      numbers: req.query.numbers ? Boolean(req.query.numbers) : true,
      symbols: req.query.symbols ? Boolean(req.query.symbols) : true,
      strict: req.query.strict ? Boolean(req.query.strict) : true,
    });
    res.status(200).send(pwd);
    return;
  };

  createVault = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw errors;
      }
      let jsonObj;
      Logger.debug(req.body);
      // const password = unescape(
      //   Buffer.from(req.body.password, "base64").toString()
      // );
      // const projectName = unescape(
      //   Buffer.from(req.body.projectName, "base64").toString()
      // );
      const password = req.body.password;
      const projectName = req.body.projectName;

      if (req.body.csv) {
        const csvdata = unescape(
          Buffer.from(req.body.csv, "base64").toString()
        );
        jsonObj = await csv({
          delimiter: ["\t"],
        }).fromString(csvdata);
      } else if (req.body.data) {
        jsonObj = req.body.data;
      }
      if (!jsonObj) {
        res.status(400);
        return;
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
      res.setHeader("Accept-Range", "byte");
      res.setHeader("Transfer-Encoding", "chunked");
      res.status(201).send(Buffer.from(arrayBuff));
    } catch (err) {
      Logger.error(err.stack);
      res.status(500).send("Error while creating the stuff... sorry...");
    }
  };
}
