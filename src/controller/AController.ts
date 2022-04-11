import { Response, Request } from "express";
import NotFound from "../domain/errors/NotFound";
import BadParameters from "../domain/errors/BadParameters";
import Logger from "../utils/logger";

export class AController {
  protected static processErrors(e: Error, res: Response): void {
    Logger.error(e);
    if (e instanceof NotFound) {
      res.status(404).send({
        code: "NOT_FOUND",
        message: e.message || "Resource not found",
      });
    } else if (e instanceof BadParameters) {
      res.status(400).send("Bad parameters");
    } else {
      res.status(500).send(e.message);
    }
  }
  protected static handleError(e: Error, req: Request, res: Response): void {
    Logger.error(JSON.stringify(e));
    if (e instanceof NotFound) {
      res
        .status(404)
        .render("page/errorPage.ejs", { error: JSON.stringify(e) });
    } else if (e instanceof BadParameters) {
      res
        .status(400)
        .render("pages/errorPage.ejs", { error: JSON.stringify(e) });
    } else {
      res
        .status(500)
        .render("pages/errorPage.ejs", { error: JSON.stringify(e) });
    }
  }
}
