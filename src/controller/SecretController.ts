import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";
import { IEncryptService } from "../services/IEncryptService";
import { AController } from "./AController";
import { Secret } from "../domain/Secret";

export class SecretController extends AController {
  encryptService: IEncryptService;

  constructor(encryptService: IEncryptService) {
    super();
    this.encryptService = encryptService;
  }
  createSecret = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // get msg to encrypt
    let payload = req.body;
    let secret = new Secret(undefined, payload.message, undefined);
    Logger.debug(`payload: ${payload.message}`);
    console.log(secret);

    // generate unique route with uuid secret

    // store msg to fs in sh256 folder
    // this.encryptService.encryptSecret(secret, "");
    // send link for share msg
  };
}
