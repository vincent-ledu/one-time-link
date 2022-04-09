import { Request, Response } from "express";
import { IDashboardService } from "../services/IDashboardService";
import Logger from "../utils/logger";
import { AController } from "./AController";

export class HomeController extends AController {
  dashboardService: IDashboardService;
  constructor(dashboardService: IDashboardService) {
    super();
    this.dashboardService = dashboardService;
  }
  home = (req: Request, res: Response): void => {
    if (this.dashboardService) {
      this.dashboardService
        .getStats()
        .then((stats) => {
          const keepassStat = stats.find(
            (stat) => stat.counterName === "KeepassCreated"
          );
          const keepassEntriesStat = stats.find(
            (stat) => stat.counterName === "KeepassEntries"
          );
          const secretsStat = stats.find(
            (stat) => stat.counterName === "SecretsEncrypted"
          );
          res.status(200).render("pages/home", {
            stats: true,
            keepassEntriesStat,
            keepassStat,
            secretsStat,
          });
        })
        .catch((error) => {
          res.status(500).send(error.message);
        });
    } else {
      res.status(200).render("pages/home", { stats: undefined });
    }
  };
  devZone = (req: Request, res: Response): void => {
    res.status(200).render("pages/devZone", {
      endpoint: `${req.protocol}://${req.get("Host")}`,
    });
  };
}
