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
    process.env.NODE_ENV = "TEST";
    process.env.SERVER_PORT = "3008";
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
    server = await startApp();
  });
  after(async () => {
    await server.stop();
  });
  it("should respond", async () => {
    const res = await axios.get(baseUrl + "/dashboard");
    expect(res.status).to.be.eq(200);
  });
});
