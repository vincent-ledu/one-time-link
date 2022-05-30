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
  it("should respond on /", async () => {
    server = await startApp();
    const res = await axios.get(baseUrl + "/");
    expect(res.status).to.be.eq(200);
  });
  it("should respond on /devzone", async () => {
    server = await startApp();
    const res = await axios.get(baseUrl + "/devzone");
    expect(res.status).to.be.eq(200);
  });
});
