import { Knex } from "knex";
import { ActuatorController } from "../controller/ActuatorController";
import { DbType } from "../utils/DbConfig";
import Routes from "./Routes";

export class ActuatorRoute extends Routes {
  actuatorController: ActuatorController;
  constructor(dbType: DbType, knex: Knex) {
    super();
    this.actuatorController = new ActuatorController(dbType, knex);
    this.intializeRoutes();
  }
  protected intializeRoutes(): void {
    this.router.get("/readiness", this.actuatorController.readiness);
    this.router.get("/liveness", this.actuatorController.liveness);
  }
}
