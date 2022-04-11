import { Response, Request } from "express";
import NotFound from "../domain/errors/NotFound";
import Logger from "../utils/logger";

export class AController {
  protected static processErrors(e: Error, res: Response): void {
    Logger.error(e);
    if (e instanceof NotFound) {
      res.status(404).send({
        code: "NOT_FOUND",
        message: e.message || "Resource not found",
      });
    } else {
      res.status(500).send(e.message);
    }
  }
  protected static handleError(err: Error, req: Request, res: Response): void {
    Logger.error(JSON.stringify(err));
    res
      .status(500)
      .render("pages/errorPage.ejs", { error: JSON.stringify(err) });
  }
}
