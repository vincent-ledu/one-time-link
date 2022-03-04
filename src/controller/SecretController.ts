import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";
import { IEncryptService } from "../services/IEncryptService";
import { AController } from "./AController";
import { Secret } from "../domain/Secret";
import InternalError from "../domain/errors/InternalError";
import app from "../app";

export class SecretController extends AController {
  getSecret = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    res.render("pages/getSecret", { id: req.params.id });
  };
  encryptService: IEncryptService;

  constructor(encryptService: IEncryptService) {
    super();
    this.encryptService = encryptService;
  }
  deleteSecret = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let payload = req.body;
    let secret = new Secret(payload.id, undefined, undefined, payload.password);
    try {
      let sec = await this.encryptService.decryptSecret(secret, true);
      secret.message = sec.message;
      res.status(200).send(secret);
      Logger.debug(`deleteSecret sec.message - ${sec.message}`);
    } catch (e) {
      Logger.error("Error while decrypting");
      res.status(500).send("Error");
    }
  };

  home = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    res.render("pages/createSecret");
  };

  createSecret = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // get msg to encrypt
    let payload = req.body;
    Logger.debug(`secretController - create secret - body:`);
    console.log(req.body);
    let secret = new Secret(
      undefined,
      payload.message,
      undefined,
      payload.password
    );
    // generate unique route with uuid secret

    // store msg to fs in sh256 folder
    await this.encryptService.encryptSecret(secret);
    // send link for share msg
    //  res.status(201).send(secret.id);
    res.status(201).render("pages/secretCreated", { id: secret.id });
  };
}
