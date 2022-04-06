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
    this.router.post("/", this.vaultController.createVault);
    this.router.get("/password", this.vaultController.generatePassword);
  }
}
