import { expect } from "chai";
import fs from "fs";
import { AES256EncryptService } from "./AES256EncryptionService";

describe("Testing encryption file", () => {
  it("should encrypt file", async () => {
    const fileToEncrypt = "./tests/data/fileToEncrypt1.txt";
    const password = "toto";
    const encrypter = new AES256EncryptService();
    fs.writeFileSync(fileToEncrypt, "Hello", "utf8");

    await encrypter.encryptFile(fileToEncrypt, password);
    expect(fs.existsSync(fileToEncrypt + ".enc"));
  });

  it("should decrypt file", async () => {
    const fileToEncrypt = "./tests/data/fileToEncrypt2.txt";
    //const targetDecryptedFile = "./tests/data/fileToEncrypt.txt";
    const password = "toto";
    const encrypter = new AES256EncryptService();
    await encrypter.decryptFile(fileToEncrypt + ".enc", password);
    expect(fs.existsSync(fileToEncrypt + ".env.unenc"));
  });
});
