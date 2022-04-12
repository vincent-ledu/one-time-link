import { App, startApp } from "../../app";
import { expect } from "chai";
import axios from "axios";
let server: App;
let baseUrl: string;

before(async () => {
  process.env.DATA_DIR = "/tmp/onedata";
  process.env.NODE_ENV = "TEST";
  process.env.SERVER_PORT = "3002";
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
describe("Secret Integration Tests", function () {
  it.skip("should server respond 200", async function () {
    const res = await axios.get(baseUrl + "/");
    expect(res.status).to.be.equal(200);
  });
  it("should create a secret to share", async function () {
    const res = await axios.post(baseUrl + "/secret", { message: "MySecret" });
    expect(res.status).to.be.equal(201);
    expect(res.data).not.to.be.equal({});
    expect(res.data).have.property("id");
    expect(res.data).have.property("password");
    expect(res.data).have.property("date");
    expect(res.data).have.property("linkToShare");
  });
  it("should get secret", async function () {
    const message = "MySecret";
    const res = await axios.post(baseUrl + "/secret", { message: message });
    expect(res.status).to.be.equal(201);
    expect(res.data).not.to.be.equal({});
    expect(res.data).have.property("id");
    expect(res.data).have.property("password");
    expect(res.data).have.property("date");
    expect(res.data).have.property("linkToShare");
    const res1 = await axios.delete(baseUrl + "/secret", {
      data: {
        id: res.data.id,
        date: res.data.date,
        password: res.data.password,
      },
    });
    expect(res1.data).have.property("message");

    expect(res1.data.message).to.be.equal(message);
    expect(res1.data.id).to.be.equal(res.data.id);
    expect(res1.data.password).to.be.equal(res.data.password);
    expect(res1.data.date).to.be.equal(res.data.date);
  });
  it("should get secret with all latin1 characters", async function () {
    const message =
      "#\"$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'";
    const res = await axios.post(baseUrl + "/secret", { message: message });
    expect(res.status).to.be.equal(201);
    expect(res.data).not.to.be.equal({});
    expect(res.data).have.property("id");
    expect(res.data).have.property("password");
    expect(res.data).have.property("date");
    expect(res.data).have.property("linkToShare");
    const res1 = await axios.delete(baseUrl + "/secret", {
      data: {
        id: res.data.id,
        date: res.data.date,
        password: res.data.password,
      },
    });
    expect(res1.data).have.property("message");

    expect(res1.data.message).to.be.equal(message);
    expect(res1.data.id).to.be.equal(res.data.id);
    expect(res1.data.password).to.be.equal(res.data.password);
    expect(res1.data.date).to.be.equal(res.data.date);
  });
  it("should get getSecret Rendered page", async function () {
    const message =
      "#\"$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'";
    const secret = await axios.post(baseUrl + "/secret", { message: message });
    const res = await axios.get(
      `${baseUrl}/secret/${secret.data.date}/${secret.data.id}/${secret.data.password}`
    );
    expect(res.status).to.be.equals(200);
  });
  it("should get error if parameters are not well formated", async function () {
    await expect(
      axios.get(`${baseUrl}/secret/20220623/123/test`)
    ).to.eventually.rejectedWith("Request failed with status code 400");
  });
  it("should get error notfound if secret does not exist", async function () {
    await expect(
      axios.delete(baseUrl + "/secret", {
        data: {
          id: "5223ec09-6666-6666-6666-06ce3754d6a9",
          date: "2022-04-11",
          password: "MQRDTRojH6hFdft2MUUaaS61",
        },
      })
    ).to.eventually.rejectedWith("Request failed with status code 404");
  });
  it("should get error bad parameter if parameters are not valid", async function () {
    await expect(
      axios.delete(baseUrl + "/secret", {
        data: {
          id: "5223ec09-6666-6666-6666",
          date: "2022-04-11",
          password: "MQRDTRojH6hFdft2MUUaaS61",
        },
      })
    ).to.eventually.rejectedWith("Request failed with status code 400");
  });
  it("should get landing page for creating secrets", async function () {
    const res = await axios.get(baseUrl + "/secret");
    expect(res.status).to.be.eq(200);
  });
  it("should return an error while message is empty", async function () {
    await expect(
      axios.post(baseUrl + "/secret", { message: "" })
    ).to.be.rejectedWith("Request failed with status code 400");
    await expect(axios.post(baseUrl + "/secret")).to.be.rejectedWith(
      "Request failed with status code 400"
    );
  });
});
