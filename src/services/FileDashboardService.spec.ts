import { FileDashboardService } from "./FileDashboardService";
import { expect } from "chai";

describe("Dashboard tests", () => {
  it("should return a secrets array", () => {
    const dashboard = new FileDashboardService("./tests/data");
    return dashboard.getSecrets().then((secrets) => {
      expect(secrets).to.be.not.undefined;
    });
  });
});
