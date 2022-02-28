import * as fs from "fs";
import * as crypto from "crypto";
import { IEncryptService } from "./IEncryptService";
import * as zlib from "zlib";
import * as path from "path";
import { AppendInitVect } from "../utils/AppendInitVector";
import Logger from "../utils/logger";

export class AES256EncryptService implements IEncryptService {
  async decryptFile(file: string, password: string): Promise<void> {
    Logger.info(`decrypting file ${file}`);
    // First, get the initialization vector from the file.
    const readInitVect = fs.createReadStream(file, { end: 15 });

    let initVect: string | Buffer;
    readInitVect.on("data", (chunk) => {
      initVect = chunk;
    });

    // Once we’ve got the initialization vector, we can decrypt the file.
    readInitVect.on("close", () => {
      const cipherKey = this.getCipherKey(password);

      const readStream = fs.createReadStream(file, { start: 16 });
      const decipher = crypto.createDecipheriv("aes256", cipherKey, initVect);
      const unzip = zlib.createUnzip();
      const writeStream = fs.createWriteStream(file + ".unenc");

      readStream.pipe(decipher).pipe(unzip).pipe(writeStream);
    });
  }
  decryptMessage(text: string, password: string): void {
    throw new Error("Method not implemented.");
  }
  getCipherKey(password: string) {
    return crypto.createHash("sha256").update(password).digest();
  }
  async encryptFile(file: string, password: string): Promise<void> {
    // Generate a secure, pseudo random initialization vector.
    Logger.info(`Encrypting file ${file}`);
    const initVect = crypto.randomBytes(16);

    // Generate a cipher key from the password.
    const CIPHER_KEY = this.getCipherKey(password);
    const readStream = fs.createReadStream(file);
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);
    const appendInitVect = new AppendInitVect(initVect, undefined);
    // Create a write stream with a different file extension.
    const writeStream = fs.createWriteStream(path.join(file + ".enc"));

    readStream.pipe(gzip).pipe(cipher).pipe(appendInitVect).pipe(writeStream);
  }
  encryptMessage(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
