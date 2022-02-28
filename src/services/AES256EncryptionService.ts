import * as fs from "fs";
import * as crypto from "crypto";
import { IEncryptService } from "./IEncryptService";
import * as zlib from "zlib";
import * as path from "path";
import { AppendInitVect } from "../utils/AppendInitVector";
import Logger from "../utils/logger";
import { Secret } from "../domain/Secret";
import { Readable } from "stream";

// See: https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e
export class AES256EncryptService implements IEncryptService {
  encryptSecret(secret: Secret): void {
    Logger.info(`Encrypting secret ${secret.id}`);
    if (secret.message !== "") {
      this.encryptMessage(secret.id, secret.message, secret.password);
    }
    if (secret.attachmentFilename !== undefined) {
      this.encryptFile(secret.id, secret.attachmentFilename, secret.password);
    }
  }
  decryptSecret(secret: Secret): void {
    Logger.info(`Decrypting secret ${secret.id}`);
    if (fs.existsSync(secret.id)) {
      this.decryptMessage(secret.id, secret.password);
      //this.decryptFile(secret.id, "file.enc", secret.password);
    }
  }
  encryptMessage(folder: string, text: string, password: string): void {
    // Generate a secure, pseudo random initialization vector.
    Logger.info(`Encrypting message in folder ${folder}`);
    const initVect = crypto.randomBytes(16);

    // Generate a cipher key from the password.
    const CIPHER_KEY = this.getCipherKey(password);
    const message = Readable.from([text]);
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);
    const appendInitVect = new AppendInitVect(initVect, undefined);
    // Create a write stream with a different file extension.
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    const writeStream = fs.createWriteStream(path.join(folder, "msg.enc"));

    message.pipe(gzip).pipe(cipher).pipe(appendInitVect).pipe(writeStream);
  }
  decryptMessage(folder: string, password: string): void {
    Logger.info(`decrypting message in folder ${folder}`);
    // First, get the initialization vector from the file.
    const readInitVect = fs.createReadStream(path.join(folder, "msg.enc"), {
      end: 15,
    });

    let initVect: string | Buffer;
    readInitVect.on("data", (chunk) => {
      initVect = chunk;
    });

    // Once we’ve got the initialization vector, we can decrypt the file.
    readInitVect.on("close", () => {
      const cipherKey = this.getCipherKey(password);

      const readStream = fs.createReadStream(path.join(folder, "msg.enc"), {
        start: 16,
      });
      const decipher = crypto.createDecipheriv("aes256", cipherKey, initVect);
      const unzip = zlib.createUnzip();
      const writeStream = fs.createWriteStream(path.join(folder, "msg.unenc"));

      readStream.pipe(decipher).pipe(unzip).pipe(writeStream);
    });
  }
  getCipherKey(password: string) {
    return crypto.createHash("sha256").update(password).digest();
  }

  async encryptFile(
    folder: string,
    file: string,
    password: string
  ): Promise<void> {
    // Generate a secure, pseudo random initialization vector.
    Logger.info(`Encrypting file ${folder}${file}`);
    const initVect = crypto.randomBytes(16);

    // Generate a cipher key from the password.
    const CIPHER_KEY = this.getCipherKey(password);
    const readStream = fs.createReadStream(path.join(folder, file));
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);
    const appendInitVect = new AppendInitVect(initVect, undefined);
    // Create a write stream with a different file extension.
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    const writeStream = fs.createWriteStream(path.join(folder, file + ".enc"));

    readStream.pipe(gzip).pipe(cipher).pipe(appendInitVect).pipe(writeStream);
  }
  async decryptFile(
    folder: string,
    file: string,
    password: string
  ): Promise<void> {
    Logger.info(`decrypting file ${folder}${file}`);
    // First, get the initialization vector from the file.
    const readInitVect = fs.createReadStream(path.join(folder, file), {
      end: 15,
    });

    let initVect: string | Buffer;
    readInitVect.on("data", (chunk) => {
      initVect = chunk;
    });

    // Once we’ve got the initialization vector, we can decrypt the file.
    readInitVect.on("close", () => {
      const cipherKey = this.getCipherKey(password);

      const readStream = fs.createReadStream(path.join(folder, file), {
        start: 16,
      });
      const decipher = crypto.createDecipheriv("aes256", cipherKey, initVect);
      const unzip = zlib.createUnzip();
      const writeStream = fs.createWriteStream(
        path.join(folder, file + ".unenc")
      );

      readStream.pipe(decipher).pipe(unzip).pipe(writeStream);
    });
  }
}
