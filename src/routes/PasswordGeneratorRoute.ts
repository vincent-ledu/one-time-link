import { query } from "express-validator";
import { PasswordGeneratorController } from "../controller/PasswordGeneratorController";
import { IPasswordGeneratorService } from "../services/IPasswordGeneratorService";
import Routes from "./Routes";

export class PasswordGeneratorRoute extends Routes {
  passwordGeneratorController: PasswordGeneratorController;
  constructor(passwordGeneratorService: IPasswordGeneratorService) {
    super();
    this.passwordGeneratorController = new PasswordGeneratorController(
      passwordGeneratorService
    );
    this.intializeRoutes();
  }
  protected intializeRoutes(): void {
    this.router.get(
      "/",
      query("len", "len must be a number between 16 to 128 characters long")
        .optional()
        .isInt({ min: 16, max: 128 })
        .trim()
        .toInt(10),
      query("numbers", "numbers must be a boolean")
        .optional()
        .isBoolean()
        .trim()
        .toBoolean(),
      query("symbols", "symbols must be a boolean")
        .optional()
        .isBoolean()
        .trim()
        .toBoolean(),
      query("strict", "stric must be a boolean")
        .optional()
        .isBoolean()
        .trim()
        .toBoolean(),

      this.passwordGeneratorController.generatePassword
    );
  }
}
