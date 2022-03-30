import { Knex } from "knex";
import { Secret } from "../domain/Secret";
import Logger from "../utils/logger";
import { IDashboardService } from "./IDashboardService";

export class MySQLDashboardService implements IDashboardService {
  knex: Knex;
  secretsTable = "secrets";
  constructor(knex: Knex) {
    this.knex = knex;
  }
  getSecrets = async (): Promise<Secret[]> => {
    try {
      return await this.knex(this.secretsTable).select();
    } catch (e) {
      Logger.error(e);
      return [];
    }
  };
}
