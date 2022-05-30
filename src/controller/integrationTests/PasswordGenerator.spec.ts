import { App, startApp } from "../../app";
import { expect } from "chai";
import axios from "axios";
import Logger from "../../utils/logger";
import sinonChai from "sinon-chai";
import sinon from "sinon";
let server: App;
let baseUrl: string;

describe("Password generator tests", () => {
  before(async () => {
    process.env.DATA_DIR = "/tmp/onedata";
    process.env.NODE_ENV = "TEST";
    process.env.SERVER_PORT = "3005";
    process.env.DB_TYPE = "IN_MEMORY";
    baseUrl = `http://localhost:${process.env.SERVER_PORT}`;
  });
  afterEach(async () => {
    await server.stop();
  });
  it("should return a default password", async () => {
    server = await startApp();
    const res = await axios.get(baseUrl + "/password");
    expect(res.data).to.be.a("string").length(20);
  });
  it("should return a password specficied by option", async () => {
    server = await startApp();
    const res = await axios.get(
      baseUrl + "/password?len=16&numbers=false&symbols=false&strict=false"
    );
    expect(res.data).to.be.a("string").length(16);
  });
  it("should return a password specficied by option", async () => {
    server = await startApp();
    const res = await axios.get(
      baseUrl + "/password?len=16&numbers=true&symbols=true&strict=true"
    );
    expect(res.data).to.be.a("string").length(16);
  });
  it("should return error if parameter are craps", async () => {
    server = await startApp();
    await expect(
      axios.get(
        baseUrl + "/password?len=12&numbers=2&symbols=hello&strict=bonjour"
      )
    ).to.eventually.rejectedWith("Request failed with status code 500");
  });
});
