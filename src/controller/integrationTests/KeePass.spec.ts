import { App, startApp } from "../../app";
import { expect } from "chai";
import axios from "axios";
import { Kdbx, KdbxCredentials } from "kdbxweb";
import { ProtectedValue } from "kdbxweb";
import Logger from "../../utils/logger";
import fs from "fs";

let server: App;
let baseUrl: string;
const password = "SecretPassword12345!#";
const latin1char =
  "#\"$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'";

before(async () => {
  process.env.DATA_DIR = "/tmp/onedata";
  process.env.NODE_ENV = "TEST";
  process.env.SERVER_PORT = "3003";
  process.env.DB_HOST = "127.0.0.1";
  process.env.DB_VERSION = "0.1";
  process.env.DB_PASSWORD = "pwd";
  process.env.DB_PORT = "3306";
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

describe("Vault Integration Tests", function () {
  this.slow(200);
  it("should server respond 200", async function () {
    const res = await axios.get(baseUrl + "/");
    expect(res.status).to.be.equal(200);
  });

  it("should create a vault by json", async function () {
    const res = await axios.post(
      baseUrl + "/vault",
      {
        projectName: "MyProject",
        password: password,
        data: [
          {
            groupe: "test",
            login: "mylogin",
            password: "secret",
            title: "yopla",
          },
        ],
      },
      {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );
    expect(res.status).to.be.equal(201);
    const file = new Uint8Array(parseInt(res.headers["content-length"]));
    file.set(new Uint8Array(res.data));
    const db = await Kdbx.load(
      file.buffer,
      new KdbxCredentials(ProtectedValue.fromString(password))
    );
    const entry = db.getDefaultGroup().groups[1].entries[0];
    expect(entry.fields.get("Title")).to.be.equal("yopla");
    expect(entry.fields.get("UserName")).to.be.equal("mylogin");
    expect(
      (entry.fields.get("Password") as ProtectedValue).getText()
    ).to.be.equal("secret");
    expect(entry.fields.get("groupe")).to.be.equal("test");
  });

  it("should create a vault by json, with 3 groups depth", async function () {
    const res = await axios.post(
      baseUrl + "/vault",
      {
        projectName: "MyProject",
        password: password,
        data: [
          {
            group1: "group1",
            group2: "group2",
            group3: "group3",
            login: "mylogin",
            password: "secret",
            title: "yopla",
          },
        ],
      },
      {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );
    expect(res.status).to.be.equal(201);
    const file = new Uint8Array(parseInt(res.headers["content-length"]));
    file.set(new Uint8Array(res.data));
    const db = await Kdbx.load(
      file.buffer,
      new KdbxCredentials(ProtectedValue.fromString(password))
    );
    expect(db.versionMajor).to.be.eq(4);
    let group = db.getDefaultGroup();
    expect(group.groups[0].name).to.be.eq("Recycle Bin");
    expect(group.groups[1].name).to.be.eq("group1");
    group = group.groups[1];
    expect(group.groups[0].name).to.be.eq("group2");
    group = group.groups[0];
    expect(group.groups[0].name).to.be.eq("group3");
    const entry = group.groups[0].entries[0];
    expect(entry.fields.get("Title")).to.be.equal("yopla");
    expect(entry.fields.get("UserName")).to.be.equal("mylogin");
    expect(
      (entry.fields.get("Password") as ProtectedValue).getText()
    ).to.be.equal("secret");
    expect(entry.fields.get("group1")).to.be.equal("group1");
    expect(entry.fields.get("group2")).to.be.equal("group2");
    expect(entry.fields.get("group3")).to.be.equal("group3");
  });

  it("should column name not starting by group, not to be a group", async function () {
    const res = await axios.post(
      baseUrl + "/vault",
      {
        projectName: "MyProject",
        password: password,
        data: [
          {
            ADgroup: "ADgroup",
            group2: "group2",
            login: "mylogin",
            password: "secret",
            title: "yopla",
          },
        ],
      },
      {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );
    expect(res.status).to.be.equal(201);
    const file = new Uint8Array(parseInt(res.headers["content-length"]));
    file.set(new Uint8Array(res.data));
    const db = await Kdbx.load(
      file.buffer,
      new KdbxCredentials(ProtectedValue.fromString(password))
    );
    expect(db.versionMajor).to.be.eq(4);
    for (const group of db.getDefaultGroup().allGroups()) {
      expect(group.name).not.to.be.eq("ADgroup");
    }
  });

  it("should store password, username and title correctly with latin1 charset", async function () {
    const res = await axios.post(
      baseUrl + "/vault",
      {
        projectName: "MyProject",
        password: password,
        data: [
          {
            login: latin1char,
            password: latin1char,
            title: latin1char,
          },
        ],
      },
      {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );
    expect(res.status).to.be.equal(201);
    const file = new Uint8Array(parseInt(res.headers["content-length"]));
    file.set(new Uint8Array(res.data));
    const db = await Kdbx.load(
      file.buffer,
      new KdbxCredentials(ProtectedValue.fromString(password))
    );
    expect(db.versionMajor).to.be.eq(4);
    const entry = db.getDefaultGroup().entries[0];
    const pwd = entry.fields.get("Password") as ProtectedValue;
    const username = entry.fields.get("UserName");
    const title = entry.fields.get("Title");

    expect(pwd.getText()).to.be.eq(latin1char);
    expect(username).to.be.eq(latin1char);
    expect(title).to.be.eq(latin1char);
  });

  it("should multiple user defined ??", async function () {
    const res = await axios.post(
      baseUrl + "/vault",
      {
        projectName: "MyProject",
        password: password,
        data: [
          {
            login: "login",
            user: "user",
            username: "username",
            utilisateur: "utilisateur",
          },
        ],
      },
      {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );
    expect(res.status).to.be.equal(201);
    const file = new Uint8Array(parseInt(res.headers["content-length"]));
    file.set(new Uint8Array(res.data));
    const db = await Kdbx.load(
      file.buffer,
      new KdbxCredentials(ProtectedValue.fromString(password))
    );
    fs.writeFileSync("/tmp/userkdbx.kdbx", Buffer.from(file.buffer));

    expect(db.versionMajor).to.be.eq(4);
    const entry = db.getDefaultGroup().entries[0];
    expect(entry.fields.get("UserName")).to.be.eq("login");
    expect(entry.fields.get("user")).to.be.eq("user");
    expect(entry.fields.get("username")).to.be.eq("username");
    expect(entry.fields.get("utilisateur")).to.be.eq("utilisateur");
  });
});
