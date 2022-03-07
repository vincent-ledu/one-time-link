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
    res.render("pages/getSecret", {
      id: req.params.id,
      password: req.params.password,
      date: req.params.date,
    });
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
    const payload = req.body;
    const secret = new Secret(
      payload.id,
      undefined,
      undefined,
      payload.password,
      payload.date
    );
    try {
      const sec = await this.encryptService.decryptSecret(secret, true);
      secret.message = sec.message;
      res.status(200).send(secret);
    } catch (e) {
      AController.processErrors(e, res);
    }
  };

  home = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    res.render("pages/createSecret");
  };

  generatePwd(): string {
    // Creating an empty array
    const result = [];

    // list of normal characters
    const characters =
      "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charactersLength = characters.length;

    // For loop to randomly select a random character from characters and add it to the result. You can change the length, (Default: 12)
    for (let i = 0; i < 24; i++) {
      result.push(
        characters.charAt(Math.floor(Math.random() * charactersLength))
      );
    }

    return result.join("");
  }

  createSecret = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // get msg to encrypt
    const payload = req.body;
    const secret = new Secret(
      undefined,
      payload.message,
      undefined,
      this.generatePwd()
    );

    try {
      await this.encryptService.encryptSecret(secret);
      res.render("pages/secretCreated", {
        id: secret.id,
        password: secret.password,
        date: secret.date,
        url: secret.date + "/" + secret.id + "/" + secret.password,
      });
    } catch (e) {
      AController.processErrors(e, res);
    }
  };
}
