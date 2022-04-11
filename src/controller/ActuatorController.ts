import { Request, Response } from "express";
import { Knex } from "knex";
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

  test(res: Response) {
    if (this.dbType === DbType.MYSQL) {
      this.knex
        .raw("select 1+1 as result")
        .then(() => {
          res.status(200).send({ dbType: this.dbType, connectionStatus: "OK" });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send(err);
        });
    } else if (this.dbType === DbType.IN_MEMORY) {
      res.status(200).send({ dbType: this.dbType });
    } else {
      Logger.error(
        `DB_TYPE not recognized: ${this.dbType}. Please review environnement variables.`
      );
      res.status(400).send({
        dbType: this.dbType,
        message:
          "DB Type not recognize... review your config file... not sure of the dbType used...",
      });
    }
  }

  readiness = async (req: Request, res: Response): Promise<void> => {
    this.test(res);
  };
  liveness = async (req: Request, res: Response): Promise<void> => {
    this.test(res);
  };
}
