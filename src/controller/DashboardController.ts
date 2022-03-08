import { NextFunction, Request, Response } from "express";
import { IDashboardService } from "../services/IDashboardService";
import Logger from "../utils/logger";
import { AController } from "./AController";

export class DashboardController extends AController {
  dashboardService: IDashboardService;
  constructor(dashboardService: IDashboardService) {
    super();
    this.dashboardService = dashboardService;
  }
  dashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const secrets = await this.dashboardService.getSecrets();
    res.render("pages/dashboard", secrets);
  };
}
