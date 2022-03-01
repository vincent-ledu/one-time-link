import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";
import { IEncryptService } from "../services/IEncryptService";
import { AController } from "./AController";
import { Secret } from "../domain/Secret";
import InternalError from "../domain/errors/InternalError";

export class SecretController extends AController {
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
    Logger.info(`deleteSecret secret.password: ${secret.password}`);
    this.encryptService.decryptSecret(secret, false).then((sec) => {
      secret.message = sec.message;
      res.status(200).send(secret);
    });
  };
  createSecret = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // get msg to encrypt
    let payload = req.body;
    Logger.info(`payload: ${payload}`);
    console.log(payload);
    let secret = new Secret(
      undefined,
      payload.message,
      undefined,
      payload.password
    );
    // generate unique route with uuid secret

    // store msg to fs in sh256 folder
    this.encryptService.encryptSecret(secret);
    // send link for share msg
    Logger.debug(
      `########### secretcontroller-create secret ######## secrete.id: ${secret.id}`
    );
    res.status(201).send(secret.id);
  };
}
