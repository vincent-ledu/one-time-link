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
    expect(await res.body).to.be.a.string;
  });
  it.skip("should return a secret unencrypted", async () => {
    const req: any = { body: { id: "123", password: "test" } };
    secretController = new SecretController(
      new AES256EncryptService("./tests/data/")
    );
    await secretController.deleteSecret(req, res, next);
    expect(status.args[0][0]).to.eq(200);
    expect(res.body).to.be.eq({ message: "Hello" });
  });
});
