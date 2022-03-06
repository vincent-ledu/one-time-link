import * as fs from "fs";
import * as crypto from "crypto";
import { IEncryptService } from "./IEncryptService";
import * as zlib from "zlib";
import * as path from "path";
import { AppendInitVect } from "../utils/AppendInitVector";
import Logger from "../utils/logger";
import { Secret } from "../domain/Secret";
import { Readable, Writable } from "stream";
import NotFound from "../domain/errors/NotFound";

// See: https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e
export class AES256EncryptService implements IEncryptService {
  baseDir: string;
  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }
  encryptSecret = async (secret: Secret): Promise<void> => {
    Logger.info(
      `Encrypting secret ${secret.id} in ${path.join(this.baseDir, secret.id)}`
    );

    if (secret.message !== "") {
      this.encryptMessage(
        path.join(this.baseDir, secret.id),
        secret.message,
        secret.password
      );
    }
    if (secret.attachmentFilename !== undefined) {
      this.encryptFile(
        path.join(this.baseDir, secret.id),
        secret.attachmentFilename,
        secret.password
      );
    }
  };
  decryptSecret = async (
    secret: Secret,
    unlink: boolean = true
  ): Promise<Secret> => {
    Logger.info(`Decrypting secret ${secret.id}`);
    if (fs.existsSync(path.join(this.baseDir, secret.id))) {
      secret.message = await this.decryptMessage(
        path.join(this.baseDir, secret.id),
        secret.password
      );
      if (unlink) {
        /* tslint:disable-next-line no-unused-expression */
        Logger.info(`deleting ${(path.join, secret.id)}`);
        fs.rm(
          path.join(this.baseDir, secret.id),
          { recursive: true, force: true },
          (err) => {
            if (err) {
              Logger.error(
                `Can't unlink folder ${path.join(this.baseDir, secret.id)} - ${
                  err.message
                }`
              );
            }
          }
        );
      }
      return secret;
    } else {
      Logger.error(`Secret ${secret.id} in folder ${this.baseDir} not found`);
      throw new NotFound(`Secret ${secret.id} not found`);
    }
  };
  encryptMessage = async (
    folder: string,
    text: string,
    password: string
  ): Promise<void> => {
    // Generate a secure, pseudo random initialization vector.
    Logger.info(`AES256 enc service - Encrypting message in folder ${folder}`);
    const initVect = crypto.randomBytes(16);

    // Generate a cipher key from the password.
    const CIPHER_KEY = this.getCipherKey(password);
    const message = Readable.from([text]);
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);
    const appendInitVect = new AppendInitVect(initVect, undefined);
    // Create a write stream with a different file extension.
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    const writeStream = fs.createWriteStream(path.join(folder, "msg.enc"));
    message.pipe(gzip).pipe(cipher).pipe(appendInitVect).pipe(writeStream);
  };
  decryptMessage = async (
    folder: string,
    password: string
    /* tslint:disable-next-line */
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      Logger.info(`Decrypting message in folder ${folder}`);
      // First, get the initialization vector from the file.
      const readInitVect = fs.createReadStream(path.join(folder, "msg.enc"), {
        end: 15,
      });

      let initVect: string | Buffer;
      readInitVect.on("data", (chunk) => {
        initVect = chunk;
      });
      readInitVect.on("close", async () => {
        const cipherKey = this.getCipherKey(password);

        if (!fs.existsSync(path.join(folder, "msg.enc"))) {
          Logger.error(`File ${path.join(folder, "msg.enc")} does not exists!`);
          throw new NotFound(`${path.join(folder, "msg.enc")} does not exists`);
        }
        const readStream = fs.createReadStream(path.join(folder, "msg.enc"), {
          start: 16,
        });
        const decipher = crypto.createDecipheriv("aes256", cipherKey, initVect);
        const unzip = zlib.createUnzip();
        const writeStream = fs.createWriteStream(
          path.join(folder, "msg.unenc")
        );
        readStream.pipe(decipher).pipe(unzip).pipe(writeStream);
        writeStream.on("finish", async () => {
          const message = fs.readFileSync(path.join(folder, "msg.unenc"));
          resolve(message.toString());
        });
        writeStream.on("error", reject);
      });
    });
  };
  getCipherKey(password: string) {
    return crypto.createHash("sha256").update(password).digest();
  }
  encryptFile = async (
    folder: string,
    file: string,
    password: string
  ): Promise<void> => {
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
      fs.mkdirSync(folder, { recursive: true });
    }
    const writeStream = fs.createWriteStream(path.join(folder, file + ".enc"));

    readStream.pipe(gzip).pipe(cipher).pipe(appendInitVect).pipe(writeStream);
  };
  async decryptFile(
    folder: string,
    file: string,
    password: string
  ): Promise<void> {
    Logger.info(`Decrypting file ${folder}${file}`);
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
