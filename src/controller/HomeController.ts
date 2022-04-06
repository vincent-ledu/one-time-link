import { Request, Response } from "express";
import { AController } from "./AController";

export class HomeController extends AController {
  constructor() {
    super();
  }
  home = (req: Request, res: Response): void => {
    res.status(200).render("pages/createSecret");
  };
  devZone = (req: Request, res: Response): void => {
    res
      .status(200)
      .render("pages/devZone", {
        endpoint: `${req.protocol}://${req.get("Host")}`,
      });
  };
}
