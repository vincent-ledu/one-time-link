import { body, param } from "express-validator";
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
    this.router.post(
      "/",
      body("message").escape().isString().isLength({ min: 1 }),
      this.secretController.createSecret
    );
    this.router.delete(
      "/",
      body("id")
        .isString()
        .escape()
        .trim()
        .matches(
          /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
        ),
      body("password")
        .isString()
        .escape()
        .trim()
        .matches(/[a-zA-Z0-9]{24}/),
      body("date")
        .isString()
        .escape()
        .trim()
        .matches(/\d{4}-\d{2}-\d{2}/),
      this.secretController.deleteSecret
    );
    this.router.get(
      "/:date/:id/:password",
      param("id")
        .isString()
        .escape()
        .trim()
        .matches(
          /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
        ),
      param("password")
        .isString()
        .escape()
        .trim()
        .matches(/[a-zA-Z0-9]{24}/),
      param("date")
        .isString()
        .escape()
        .trim()
        .matches(/\d{4}-\d{2}-\d{2}/),
      this.secretController.getSecret
    );
    this.router.get("/", this.secretController.home);
  }
}
