import { SecretController } from "../controller/SecretController";
import { IEncryptService } from "../services/IEncryptService";
import Routes from "./Routes";

export class SecretRoute extends Routes {
  secretController: SecretController;

  constructor(encryptService: IEncryptService) {
    super();
    this.secretController = new SecretController(encryptService);
    this.intializeRoutes();
  }
  protected intializeRoutes(): void {
    this.router.post("/", this.secretController.createSecret);
    this.router.delete("/", this.secretController.deleteSecret);
  }
}
