import { expect } from "chai";
import sinon from "sinon";
import { AES256EncryptService } from "../services/AES256EncryptionService";
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
    const req: any = { body: { message: "Hello" } };
    secretController = new SecretController(new AES256EncryptService());
    await secretController.createSecret(req, res, next);

    //expect(status.calledOnce).to.be.true;
    expect(status.args[0][0]).to.eq(201);
  });
});
