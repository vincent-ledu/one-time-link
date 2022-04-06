import { expect } from "chai";
import dbConfig from "../utils/DbConfig";
import KnexInitializer from "../utils/KnexInitializer";
import { MySQLDashboardService } from "./MySQLFileDashboardService";

describe("Dashboard tests", () => {
  it.skip("should return a secrets array", () => {
    const dbconfig = dbConfig();
    const knexInitializer = new KnexInitializer(dbconfig);
    const dashboard = new MySQLDashboardService(
      knexInitializer.getKnexInstance()
    );
    return dashboard.getStats().then((counters) => {
      expect(counters).to.be.not.undefined;
    });
  });
});
