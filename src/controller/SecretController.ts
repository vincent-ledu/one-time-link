import { Request, Response } from "express";
import { IEncryptService } from "../services/IEncryptService";
import { AController } from "./AController";
import { Secret } from "../domain/Secret";
import { validationResult } from "express-validator";

export class SecretController extends AController {
  encryptService: IEncryptService;

  constructor(encryptService: IEncryptService) {
    super();
    this.encryptService = encryptService;
  }
  getSecret = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw errors;
      }

      res.render("pages/getSecret", {
        error: undefined,
        id: req.params.id,
        password: req.params.password,
        date: req.params.date,
      });
    } catch (e) {
      AController.handleError(e, req, res);
    }
  };
  deleteSecret = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw errors;
      }
      const payload = req.body;
      const secret = new Secret(
        payload.id,
        undefined,
        undefined,
        payload.password,
        payload.date
      );
      const sec = await this.encryptService.decryptSecret(secret, true);
      secret.message = sec.message;
      res.status(200).send(secret);
    } catch (e) {
      AController.processErrors(e, res);
    }
  };

  home = async (req: Request, res: Response): Promise<void> => {
    res.render("pages/createSecret");
  };

  createSecret = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw errors;
      }
      const payload = req.body;
      const secret = new Secret(
        undefined,
        payload.message,
        undefined,
        this.generatePwd()
      );
      await this.encryptService.encryptSecret(secret);
      res.render("pages/secretCreated", {
        error: undefined,
        id: secret.id,
        password: secret.password,
        date: secret.date,
        url: secret.date + "/" + secret.id + "/" + secret.password,
      });
    } catch (e) {
      AController.handleError(e, req, res);
    }
  };

  private generatePwd(): string {
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
}
