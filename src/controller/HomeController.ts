import { Request, Response } from "express";
import { AController } from "./AController";

export class HomeController extends AController {
  constructor() {
    super();
  }
  home = async (req: Request, res: Response): Promise<void> => {
    res.status(200).render("pages/createSecret");
  };
}
