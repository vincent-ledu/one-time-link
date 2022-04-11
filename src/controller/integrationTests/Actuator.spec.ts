import { App, startApp } from "../../app";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { expect } from "chai";
import axios from "axios";
import Logger from "../../utils/logger";
import sinonChai from "sinon-chai";
import sinon from "sinon";
chai.use(chaiAsPromised);
let server: App;
let baseUrl: string;

describe("Actuator tests", () => {
  beforeEach(async () => {
    process.env.DATA_DIR = "/tmp/onedata";
    process.env.NODE_ENV = "TEST";
    process.env.SERVER_PORT = "3004";
    process.env.DB_HOST = "127.0.0.1";
    process.env.DB_VERSION = "0.1";
    process.env.DB_PASSWORD = "pwd";
    process.env.DB_PORT = "4406";
    process.env.DB_NAME = "one-time-link-db";
    process.env.DB_TYPE = "MYSQL";
    process.env.DB_USER = "one-time-link-user";
    process.env.DB_SSL = "false";
    process.env.DB_TABLE_PREFIX = "otl_";
    process.env.KP_GROUPS = "GROUP,GROUPE,GRP";
    process.env.KP_TITLES = "TITLE,TITRE,LIBELLE,DESCRIPTION";
    process.env.KP_USERNAMES = "LOGIN,USERNAME,USER,UTILISATEUR";
    process.env.KP_PASSWORDS = "PASSWORD,MOT DE PASSE,PASSE,PASS,PWD,MDP";
    baseUrl = `http://localhost:${process.env.SERVER_PORT}`;
  });
  afterEach(async () => {
    await server.stop();
  });
  it("should be ok for mysql", async () => {
    server = await startApp();
    const resReadiness = await axios.get(baseUrl + "/actuator/readiness");
    const resLiveness = await axios.get(baseUrl + "/actuator/liveness");
    expect(resReadiness.status).to.be.equal(200);
    expect(resLiveness.status).to.be.equal(200);
  });
  it("should be ok for memory/file", async () => {
    process.env.DB_TYPE = "IN_MEMORY";
    server = await startApp();
    const resReadiness = await axios.get(baseUrl + "/actuator/readiness");
    const resLiveness = await axios.get(baseUrl + "/actuator/liveness");
    expect(resReadiness.status).to.be.equal(200);
    expect(resLiveness.status).to.be.equal(200);
  });
  it("should return 500 for a weird config db type", async () => {
    process.env.DB_TYPE = "weird";
    server = await startApp();
    await expect(
      axios.get(baseUrl + "/actuator/readiness")
    ).to.eventually.rejectedWith("Request failed with status code 500");
    await expect(
      axios.get(baseUrl + "/actuator/liveness")
    ).to.eventually.rejectedWith("Request failed with status code 500");
  });
  it("should return 500 if db not found", async () => {
    process.env.DB_PORT = "666";
    server = await startApp();
    await expect(
      axios.get(baseUrl + "/actuator/readiness")
    ).to.eventually.rejectedWith("Request failed with status code 500");
    await expect(
      axios.get(baseUrl + "/actuator/liveness")
    ).to.eventually.rejectedWith("Request failed with status code 500");
  });
});
