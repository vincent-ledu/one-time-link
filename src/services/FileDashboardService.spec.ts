import { FileDashboardService } from "./FileDashboardService";

describe("Dashboard tests", () => {
  it("should return a secrets array", () => {
    const dashboard = new FileDashboardService("./tests/data");
    return dashboard.getSecrets().then((secrets) => {
      console.log(
        `Dashboard tets - return secrests array: ${JSON.stringify(secrets)}`
      );
    });
  });
});
