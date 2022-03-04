import { expect } from "chai";
import fs from "fs";
import { AES256EncryptService } from "./AES256EncryptionService";
import * as path from "path";
import { Secret } from "../domain/Secret";

/* tslint:disable no-unused-expression */
describe("Testing encryption service", () => {
  it("should encrypt file", async () => {
    const fileToEncrypt = "fileToEncrypt1.txt";
    const folder = "./tests/data/";
    const password = "toto";
    const encrypter = new AES256EncryptService(folder);
    fs.writeFileSync(fileToEncrypt, "Hello", "utf8");

    await encrypter.encryptFile(folder, fileToEncrypt, password);
    expect(fs.existsSync(path.join(folder, fileToEncrypt + ".enc"))).to.be.true;
  });

  it("should decrypt file", async () => {
    const fileToEncrypt = "fileToEncrypt2.txt";
    const folder = "./tests/data/";
    // const targetDecryptedFile = "./tests/data/fileToEncrypt.txt";
    const password = "toto";
    const encrypter = new AES256EncryptService(folder);
    await encrypter.decryptFile(folder, fileToEncrypt + ".enc", password);
    expect(fs.existsSync(path.join(folder, fileToEncrypt + ".enc.unenc"))).to.be
      .true;
  });

  it("should encrypt message", async () => {
    const folder = "./tests/data/msg1/";
    const password = "toto";
    const message = "hello";

    const encrypter = new AES256EncryptService(folder);
    await encrypter.encryptMessage(folder, message, password);
    expect(fs.existsSync(path.join(folder + "msg.enc"))).to.be.true;
  });
  it("should decrypt message", async () => {
    const folder = "./tests/data/msg2/";
    const password = "toto";

    const encrypter = new AES256EncryptService(folder);
    encrypter.decryptMessage(folder, password).then((message) => {
      expect(message).to.be.eq("hello");
    });
  });
  it("should encrypt secret", async () => {
    const folder = "./tests/data/";
    const secret = new Secret(
      "04e35381-835e-4958-b23b-eb1c8e47b634",
      "test",
      undefined,
      "test"
    );
    const encrypter = new AES256EncryptService(folder);
    await encrypter.encryptSecret(secret);
    expect(fs.existsSync(path.join(folder, secret.id, "/msg.enc"))).to.be.true;
  });
  it("should decrypt secret", async () => {
    const folder = "./tests/data/";
    const secret = new Secret(
      "a9133087-3a17-4f99-a50c-247e84ab66da",
      undefined,
      undefined,
      "test"
    );
    const encrypter = new AES256EncryptService(folder);
    const sec = await encrypter.decryptSecret(secret, false);
    expect(sec.message).to.be.equals("test");
  });
});
