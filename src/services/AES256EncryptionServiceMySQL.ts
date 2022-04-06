import * as crypto from "crypto";
import fs from "fs";
import { IEncryptService } from "./IEncryptService";
import * as zlib from "zlib";
import { AppendInitVect } from "../utils/AppendInitVector";
import Logger from "../utils/logger";
import { Secret } from "../domain/Secret";
import { Readable } from "stream";
import { BufferStream } from "../utils/BufferStream";
import { Knex } from "knex";
import path from "path";
import os from "os";
import Constants from "../../Constants";

function tmpFile(prefix: string, suffix: string, tmpdir: string) {
  prefix = typeof prefix !== "undefined" ? prefix : "tmp.";
  suffix = typeof suffix !== "undefined" ? suffix : "";
  tmpdir = tmpdir ? tmpdir : os.tmpdir();
  return path.join(
    tmpdir,
    prefix + crypto.randomBytes(16).toString("hex") + suffix
  );
}

// See: https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e
export class AES256EncryptServiceMySQL implements IEncryptService {
  knex: Knex;
  secretTable = Constants.TABLE_NAMES.SECRETS;
  counterTable = Constants.TABLE_NAMES.COUNTER;
  constructor(knex: Knex) {
    this.knex = knex;
  }
  upCounter = async (counterName: string): Promise<void> => {
    if (this.knex) {
      const total = await this.knex(this.counterTable)
        .where("counterName", "=", counterName)
        .count("counter as c");
      if (total[0].c === 0) {
        await this.knex(this.counterTable).insert({
          counterName: counterName,
        });
      }
      this.knex(this.counterTable)
        .where("counterName", "=", counterName)
        .increment("counter", 1)
        .catch((reason) => {
          Logger.error("Counter increment error");
          Logger.error(reason);
        });
    }
  };

  encryptSecret = async (secret: Secret): Promise<void> => {
    Logger.info(`Encrypting secret ${secret.id} from db`);

    if (secret.message !== "") {
      this.encryptMessage(secret.id, secret.message, secret.password);
      this.upCounter("SecretsEncrypted");
    }
  };
  decryptSecret = async (secret: Secret): Promise<Secret> => {
    Logger.info(`Decrypting secret ${secret.id}`);
    secret.message = await this.decryptMessage(secret.id, secret.password);
    this.upCounter("SecretsDecrypted");
    return secret;
  };
  encryptMessage = (id: string, text: string, password: string): void => {
    // Generate a secure, pseudo random initialization vector.
    Logger.info(`AES256 enc service - Encrypting message ${id}`);
    const initVect = crypto.randomBytes(16);

    // Generate a cipher key from the password.
    const CIPHER_KEY = this.getCipherKey(password);
    const message = Readable.from([text]);
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);
    const appendInitVect = new AppendInitVect(initVect, undefined);

    const bs = new BufferStream({});
    bs.on("finish", async () => {
      try {
        await this.knex(this.secretTable).insert({
          id: id,
          message: bs.content.toString("base64"),
        });
      } catch (error) {
        Logger.error("knex error");
        Logger.error(error);
      }
    });
    message.pipe(gzip).pipe(cipher).pipe(appendInitVect).pipe(bs);
  };

  decryptMessage = async (id: string, password: string): Promise<string> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      Logger.info(`Decrypting message ${id}`);
      try {
        const message = await this.knex(this.secretTable)
          .select("message")
          .where("id", id)
          .first();
        Logger.info(`decrypt - message: ${message.message}`);
        const tmpfilename = tmpFile("onetimelink", "tmp", "/tmp/");
        fs.writeFile(
          tmpfilename,
          Buffer.from(message.message, "base64"),
          () => {
            const readInitVect = fs.createReadStream(tmpfilename, { end: 15 });

            let initVect: string | Buffer;
            readInitVect.on("data", (chunk) => {
              initVect = chunk;
            });
            readInitVect.on("close", async () => {
              const cipherKey = this.getCipherKey(password);

              const readStream = fs.createReadStream(tmpfilename, {
                start: 16,
              });
              const decipher = crypto.createDecipheriv(
                "aes256",
                cipherKey,
                initVect
              );
              const unzip = zlib.createUnzip();
              const bs = new BufferStream({});

              readStream.pipe(decipher).pipe(unzip).pipe(bs);
              bs.on("finish", async () => {
                resolve(bs.content.toString());
                fs.unlink(tmpfilename, (err) => {
                  if (err) {
                    Logger.error(
                      `Error while trying to delete tmp file: ${tmpfilename}`
                    );
                  } else {
                    Logger.info(`${tmpfilename} deleted`);
                  }
                });
                this.knex(this.secretTable)
                  .where("id", id)
                  .del()
                  .then(() => {
                    Logger.info(`Record deleted: ${id}`);
                  })
                  .catch((err) => {
                    Logger.error(
                      `Error while trying to delete record ${id} after decrypt. Error: ${err.message}`
                    );
                  });
              });
              bs.on("error", (e) => {
                fs.unlink(tmpfilename, () => {
                  Logger.info(`${tmpfilename} deleted`);
                });
                Logger.error(e);
                reject(e);
              });
            });
          }
        );
      } catch (error) {
        Logger.error("knex error");
        Logger.error(error);
        reject(error);
      }
      // First, get the initialization vector from the file.
    });
  };
  getCipherKey(password: string) {
    return crypto.createHash("sha256").update(password).digest();
  }
}
