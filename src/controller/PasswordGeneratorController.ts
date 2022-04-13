import { AController } from "./AController";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { IPasswordGeneratorService } from "../services/IPasswordGeneratorService";
import { Get, Route } from "tsoa";

@Route("password")
export class PasswordGeneratorController extends AController {
  passwordGeneratorService: IPasswordGeneratorService;
  constructor(passwordGeneratorService: IPasswordGeneratorService) {
    super();
    this.passwordGeneratorService = passwordGeneratorService;
  }
  @Get("/")
  generatePassword = (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw errors;
      }
      const length = req.query.len ? parseInt(req.query.len.toString()) : 20;
      const numbers = req.query.numbers ? Boolean(req.query.numbers) : true;
      const symbols = req.query.symbols ? Boolean(req.query.symbols) : true;
      const strict = req.query.strict ? Boolean(req.query.strict) : true;

      res
        .status(201)
        .send(
          this.passwordGeneratorService.generatePassword(
            length,
            numbers,
            symbols,
            strict
          )
        );
      return;
    } catch (err) {
      AController.processErrors(err, res);
    }
  };
}
