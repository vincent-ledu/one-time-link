import { DashboardController } from "../controller/DashboardController";
import { IDashboardService } from "../services/IDashboardService";
import Routes from "./Routes";

export class DashboardRoute extends Routes {
  dashboardController: DashboardController;
  constructor(dashboardService: IDashboardService) {
    super();
    this.dashboardController = new DashboardController(dashboardService);
    this.intializeRoutes();
  }
  protected intializeRoutes(): void {
    this.router.get("/", this.dashboardController.dashboard);
  }
}
