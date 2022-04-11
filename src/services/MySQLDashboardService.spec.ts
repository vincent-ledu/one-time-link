import { expect } from "chai";
import { Knex } from "knex";
import dbConfig from "../utils/DbConfig";
import KnexInitializer from "../utils/KnexInitializer";
import Logger from "../utils/logger";
import { MySQLDashboardService } from "./MySQLFileDashboardService";

describe("Dashboard tests", () => {
  let knex: Knex;
  before(() => {
    const dbconfig = dbConfig();
    const knexInitializer = new KnexInitializer(dbconfig);
    knex = knexInitializer.getKnexInstance();
  });
  after(() => {
    knex.destroy();
  });
  it("should return a secrets array", async function () {
    const dashboard = new MySQLDashboardService(knex);
    const stats = await dashboard.getStats();
    const keepassStat = stats.find(
      (stat) => stat.counterName === "KeepassCreated"
    );
    const keepassEntriesStat = stats.find(
      (stat) => stat.counterName === "KeepassEntries"
    );
    const secretsStat = stats.find(
      (stat) => stat.counterName === "SecretsEncrypted"
    );
    const secretsDecryptedStat = stats.find(
      (stat) => stat.counterName === "SecretsDecrypted"
    );
    expect(stats).to.be.not.undefined;
    expect(keepassStat.counter).to.be.a("number");
    expect(keepassEntriesStat.counter).to.be.a("number");
    expect(secretsStat.counter).to.be.a("number");
    expect(secretsDecryptedStat.counter).to.be.a("number");
  });
});
