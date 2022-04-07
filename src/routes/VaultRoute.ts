import { body, param } from "express-validator";
import { VaultController } from "../controller/VaultController";
import { IVaultService } from "../services/IVaultService";
import Routes from "./Routes";

export class VaultRoute extends Routes {
  vaultController: VaultController;
  constructor(vaultService: IVaultService) {
    super();
    this.vaultController = new VaultController(vaultService);
    this.intializeRoutes();
  }
  protected intializeRoutes(): void {
    this.router.get("/", this.vaultController.home);
    this.router.post(
      "/",
      body(
        "projectName",
        "projectName must be a string between 0 to 128 characters long"
      )
        .isString()
        .escape()
        .trim()
        .isLength({ min: 0, max: 128 }),
      body(
        "password",
        "password must be a string between 16 to 128 characters long"
      )
        .isString()
        .trim()
        .isLength({ min: 16, max: 128 }),
      body("csv", "csv must be a escaped string base 64 encoded")
        .optional()
        .isString()
        .isBase64()
        .trim(),
      body("data").optional().isArray(),
      this.vaultController.createVault
    );
  }
}
