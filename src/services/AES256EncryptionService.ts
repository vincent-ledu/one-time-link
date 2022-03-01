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
import { loggers } from "winston";
import { resolve } from "path/posix";

// See: https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e
export class AES256EncryptService implements IEncryptService {
  baseDir: string;
  constructor(baseDir: string) {
    Logger.info(`DATA_DIR : ${baseDir}`);
    this.baseDir = baseDir;
  }
  encryptSecret(secret: Secret): void {
    Logger.info(
      `Encrypting secret ${secret.id} in ${path.join(this.baseDir, secret.id)}`
    );
    Logger.info(`message: ${secret.message}`);
    if (secret.message !== "") {
      Logger.info('Message !== ""');
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
  }
  async decryptSecret(secret: Secret, unlink: boolean = true): Promise<Secret> {
    Logger.info(`Decrypting secret ${secret.id}`);

    if (fs.existsSync(path.join(this.baseDir, secret.id))) {
      Logger.debug(
        `decryptsecret - path ${path.join(this.baseDir, secret.id)} exists`
      );
      return new Promise(function (resolve, reject) {
        AES256EncryptService.decryptMessage(
          path.join(this.baseDir, secret.id),
          secret.password
        ).then((message: string) => {
          secret.message = message.toString();
          Logger.info("getting unenc data in decryptsecret");
          resolve(secret);
        });
        //this.decryptFile(path.join(this.baseDir, secret.id), "file.enc", secret.password);
        if (false && unlink) {
          fs.rm(
            path.join(this.baseDir, secret.id),
            { recursive: true, force: true },
            (err) => {
              Logger.error(
                `Can't unlink folder ${path.join(this.baseDir, secret.id)}`,
                err
              );
            }
          );
        }
      });
    } else {
      Logger.error(`Secret ${secret.id} in folder ${this.baseDir} not found`);
      throw new NotFound(`Secret ${secret.id} not found`);
    }
  }
  encryptMessage(folder: string, text: string, password: string): void {
    // Generate a secure, pseudo random initialization vector.
    Logger.info(`Encrypting message in folder ${folder}`);
    Logger.info("pre mkdir");
    const initVect = crypto.randomBytes(16);
    Logger.info("pre mkdir");

    // Generate a cipher key from the password.
    const CIPHER_KEY = AES256EncryptService.getCipherKey(password);
    Logger.info("pre mkdir");
    const message = Readable.from([text]);
    Logger.info("pre mkdir");
    const gzip = zlib.createGzip();
    Logger.info("pre mkdir");
    const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);
    Logger.info("pre mkdir");
    const appendInitVect = new AppendInitVect(initVect, undefined);
    // Create a write stream with a different file extension.
    Logger.info("pre mkdir");
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    Logger.info(`Writing secret to ${path.join(folder, "msg.enc")}`);
    const writeStream = fs.createWriteStream(path.join(folder, "msg.enc"));
    writeStream.on("end", () => {
      Logger.info(`Writing secret to ${path.join(folder, "msg.enc")} finished`);
    });
    message.pipe(gzip).pipe(cipher).pipe(appendInitVect).pipe(writeStream);
  }
  static decryptMessage(folder: string, password: string): Promise<string> {
    Logger.info(`decrypting message in folder ${folder}`);
    // First, get the initialization vector from the file.
    const readInitVect = fs.createReadStream(path.join(folder, "msg.enc"), {
      end: 15,
    });

    let initVect: string | Buffer;
    return new Promise(function (resolve, reject) {
      readInitVect
        .on("data", (chunk) => {
          initVect = chunk;
        })
        .on("close", () => {
          Logger.debug("readinitvect on close");
          const cipherKey = AES256EncryptService.getCipherKey(password);

          if (!fs.existsSync(path.join(folder, "msg.enc"))) {
            Logger.error(
              `File ${path.join(folder, "msg.enc")} does not exists!`
            );
            throw new NotFound(
              `${path.join(folder, "msg.enc")} does not exists`
            );
          }
          const readStream = fs.createReadStream(path.join(folder, "msg.enc"), {
            start: 16,
          });
          const decipher = crypto.createDecipheriv(
            "aes256",
            cipherKey,
            initVect
          );
          const unzip = zlib.createUnzip();
          const writeStream = fs.createWriteStream(
            path.join(folder, "msg.unenc")
          );
          writeStream.on("finish", () => {
            fs.readFile(path.join(folder, "msg.unenc"), (err, data) => {
              if (err) throw err;
              Logger.info(`ENENCRYPTED DATA: ${data.toString()}`);
              resolve(data.toString());
            });
          });
          readStream.pipe(decipher).pipe(unzip).pipe(writeStream);
        });
    });
  }
  static getCipherKey(password: string) {
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
    const CIPHER_KEY = AES256EncryptService.getCipherKey(password);
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
      const cipherKey = AES256EncryptService.getCipherKey(password);

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
