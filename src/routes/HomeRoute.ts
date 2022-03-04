import { HomeController } from "../controller/HomeController";
import Routes from "./Routes";

export class HomeRoute extends Routes {
  homeController: HomeController;
  constructor() {
    super();
    this.homeController = new HomeController();
    this.intializeRoutes();
  }
  protected intializeRoutes(): void {
    this.router.get("/", this.homeController.home);
  }
}
