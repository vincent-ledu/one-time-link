import { expect } from "chai";
import knex from "knex";
import { Secret } from "../domain/Secret";
import dbConfig from "../utils/DbConfig";
import KnexInitializer from "../utils/KnexInitializer";
import Logger from "../utils/logger";
import { AES256EncryptServiceMySQL } from "./AES256EncryptionServiceMySQL";

/* tslint:disable no-unused-expression */
describe.skip("Testing encryption service", () => {
  it.skip("should encrypt secret", async () => {
    const secret = new Secret(
      "a9133087-3a17-4f99-a50c-247e84ab66da",
      "test",
      undefined,
      "test",
      "2022-03-07"
    );
    const dbconfig = dbConfig();
    const knexInitializer = new KnexInitializer(dbconfig);
    const encrypter = new AES256EncryptServiceMySQL(
      knexInitializer.getKnexInstance()
    );
    await encrypter.encryptSecret(secret);
  });
  it.skip("should decrypt secret", async () => {
    const secret = new Secret(
      "a9133087-3a17-4f99-a50c-247e84ab66da",
      undefined,
      undefined,
      "test",
      "2022-03-07"
    );
    const knexInitializer = new KnexInitializer(dbConfig());
    const encrypter = new AES256EncryptServiceMySQL(
      knexInitializer.getKnexInstance()
    );
    const sec = await encrypter.decryptSecret(secret, false);
    expect(sec.message).to.be.equals("test");
  });
});
