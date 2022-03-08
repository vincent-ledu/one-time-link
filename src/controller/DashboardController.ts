import { Request, Response } from "express";
import { IDashboardService } from "../services/IDashboardService";
import Logger from "../utils/logger";
import { AController } from "./AController";

export class DashboardController extends AController {
  dashboardService: IDashboardService;
  constructor(dashboardService: IDashboardService) {
    super();
    this.dashboardService = dashboardService;
  }
  dashboard = async (req: Request, res: Response): Promise<void> => {
    const secrets = await this.dashboardService.getSecrets();
    Logger.debug(`dashboard - secrets: ${JSON.stringify(secrets)}`);
    res.render("pages/dashboard", { secrets: secrets });
  };
}
