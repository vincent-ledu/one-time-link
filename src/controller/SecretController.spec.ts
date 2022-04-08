import { expect } from "chai";
import { SecretController } from "./SecretController";
import { AES256EncryptServiceFile } from "../services/AES256EncryptionServiceFile";
import sinon from "sinon";
import sinonchai from "sinon-chai";
import chai from "chai";
chai.use(sinonchai);

const mockResponse = () => {
  const res: any = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  res.send = sinon.stub().returns(res);
  res.setHeader = sinon.stub().returns(res);
  return res;
};
const mockRequest = (options?: any): any => {
  let req: any = {};
  req.headers = sinon.stub().returns(req);
  req.get = sinon.stub().returns(req);
  req = { ...req, ...options };
  return req;
};

describe("Testing Secret Conroller", function () {
  // let app: supertest.SuperTest<supertest.Test>;

  it("should do smth", async function () {
    const secretController = new SecretController(
      new AES256EncryptServiceFile("/tmp/")
    );
    const req = mockRequest({ body: { message: "secret123" } });
    const res = mockResponse();
    await secretController.createSecret(req, res);
    expect(res.status).have.been.calledOnceWith(201);
  });
});
