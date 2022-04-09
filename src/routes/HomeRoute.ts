import { HomeController } from "../controller/HomeController";
import { IDashboardService } from "../services/IDashboardService";
import Routes from "./Routes";

export class HomeRoute extends Routes {
  homeController: HomeController;
  constructor(dashBoardService: IDashboardService) {
    super();
    this.homeController = new HomeController(dashBoardService);
    this.intializeRoutes();
  }
  protected intializeRoutes(): void {
    this.router.get("/", this.homeController.home);
    this.router.get("/devZone", this.homeController.devZone);
  }
}
