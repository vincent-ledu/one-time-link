import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";
import { AController } from "./AController";

export class HomeController extends AController {
  constructor() {
    super();
  }
  home = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    res.status(200).render("pages/createSecret");
  };
}