import { expect } from "chai";
import fs from "fs";
import { AES256EncryptService } from "./AES256EncryptionService";
import * as path from "path";
import { Secret } from "../domain/Secret";

/* tslint:disable no-unused-expression */
describe("Testing encryption service", () => {
  it("should encrypt secret", async () => {
    const folder = "./tests/data/";
    const secret = new Secret(
      "a9133087-3a17-4f99-a50c-247e84ab66da",
      "test",
      undefined,
      "test",
      "2022-03-07"
    );
    const encrypter = new AES256EncryptService(folder);
    await encrypter.encryptSecret(secret);
    expect(fs.existsSync(path.join(folder, secret.date, secret.id, "/msg.enc")))
      .to.be.true;
  });
  it("should decrypt secret", async () => {
    const folder = "./tests/data/";
    const secret = new Secret(
      "a9133087-3a17-4f99-a50c-247e84ab66da",
      undefined,
      undefined,
      "test",
      "2022-03-07"
    );
    const encrypter = new AES256EncryptService(folder);
    const sec = await encrypter.decryptSecret(secret, false);
    expect(sec.message).to.be.equals("test");
  });
});
