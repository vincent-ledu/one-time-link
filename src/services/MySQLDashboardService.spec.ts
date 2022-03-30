import { expect } from "chai";
import dbConfig from "../utils/DbConfig";
import KnexInitializer from "../utils/KnexInitializer";
import { MySQLDashboardService } from "./MySQLFileDashboardService";

describe("Dashboard tests", () => {
  it("should return a secrets array", () => {
    const dbconfig = dbConfig();
    const knexInitializer = new KnexInitializer(dbconfig);
    const dashboard = new MySQLDashboardService(
      knexInitializer.getKnexInstance()
    );
    return dashboard.getSecrets().then((secrets) => {
      expect(secrets).to.be.not.undefined;
    });
  });
});
