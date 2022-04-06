import { Request, Response } from "express";
import { IDashboardService } from "../services/IDashboardService";
import { AController } from "./AController";

export class DashboardController extends AController {
  dashboardService: IDashboardService;
  constructor(dashboardService: IDashboardService) {
    super();
    this.dashboardService = dashboardService;
  }

  dashboard = async (req: Request, res: Response): Promise<void> => {
    this.dashboardService
      .getStats()
      .then((counters) => {
        res.render("pages/dashboard", { counters: counters });
      })
      .catch((error) => {
        res.status(500).send(error.message);
      });
  };
}
