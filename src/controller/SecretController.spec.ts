import { expect } from "chai";
import sinon from "sinon";
import { loggers } from "winston";
import { AES256EncryptService } from "../services/AES256EncryptionService";
import Logger from "../utils/logger";
import { SecretController } from "./SecretController";

describe("Secret controller tests", () => {
  let status: any,
    send: any,
    res: any,
    next: any,
    secretController: SecretController;
  beforeEach(() => {
    status = sinon.stub();
    send = sinon.stub();
    res = { send, status };
    status.returns(res);
  });
  it("should create a new secret", async () => {
    const req: any = { body: { message: "Hello", password: "test" } };
    secretController = new SecretController(
      new AES256EncryptService("./tests/data/temp/")
    );
    await secretController.createSecret(req, res, next);

    expect(status.calledOnce).to.be.true;
    expect(status.args[0][0]).to.eq(201);
    expect(res.body).to.be.a.string;
    Logger.info(
      "###################CREATE SECRET################ res.body: " + res.body
    );
    Logger.info(
      "###################CREATE SECRET################ res.status: " +
        status.args[0][0]
    );
  });
  it("should return a secret unencrypted", async () => {
    const req: any = { body: { id: "123", password: "test" } };
    secretController = new SecretController(
      new AES256EncryptService("./tests/data/")
    );
    await secretController.deleteSecret(req, res, next);
    Logger.info(
      "######################################### res.body: " + res.body
    );
    expect(status.args[0][0]).to.eq(200);
    console.log(res.body);
    expect(res.body).to.be.eq({ message: "Hello" });
  });
});
