import { Knex } from "knex";
import { Counter } from "../domain/Counter";
import Logger from "../utils/logger";
import { IDashboardService } from "./IDashboardService";
import { Constants } from "../domain/Constants";

export class MySQLDashboardService implements IDashboardService {
  knex: Knex;
  counterTable = Constants.TABLE_NAMES.COUNTER;
  constructor(knex: Knex) {
    this.knex = knex;
  }
  getStats = async (): Promise<Counter[]> => {
    try {
      return await this.knex(this.counterTable).select();
    } catch (e) {
      Logger.error(e);
      return [];
    }
  };
}
