import { Router } from "express";

export default abstract class Routes {
  router: Router;
  constructor() {
    this.router = Router();
  }
  protected abstract intializeRoutes(): void;
}
