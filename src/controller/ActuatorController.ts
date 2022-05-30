import { Request, Response } from "express";
import { Knex } from "knex";
import InternalError from "../domain/errors/InternalError";
import { DbType } from "../utils/DbConfig";
import Logger from "../utils/logger";
import { AController } from "./AController";

export class ActuatorController extends AController {
  dbType: DbType;
  knex: Knex;
  constructor(dbType: DbType, knex: Knex) {
    super();
    this.dbType = dbType;
    this.knex = knex;
  }

  async test(res: Response): Promise<boolean> {
    if (this.dbType === DbType.MYSQL) {
      try {
        await this.knex.raw("select 1+1 as result");
        return true;
      } catch (err) {
        throw new InternalError("Mysql not reachable");
      }
    } else if (this.dbType === DbType.IN_MEMORY) {
      return true;
    } else {
      throw new InternalError(
        `DB_TYPE not recognized: ${this.dbType}. Please review environnement variables.`
      );
    }
  }

  readiness = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.test(res);
      res.status(200).send({ dbType: this.dbType, connectionStatus: "OK" });
    } catch (err) {
      Logger.error(err.stack);
      AController.processErrors(err, res);
    }
  };
  liveness = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.test(res);
      res.status(200).send({ dbType: this.dbType, connectionStatus: "OK" });
    } catch (err) {
      Logger.error(err.stack);
      AController.processErrors(err, res);
    }
  };
}
