import { expect } from "chai";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { Knex } from "knex";
import { Secret } from "../domain/Secret";
import dbConfig from "../utils/DbConfig";
import KnexInitializer from "../utils/KnexInitializer";
import Logger from "../utils/logger";
import { AES256EncryptServiceMySQL } from "./AES256EncryptionServiceMySQL";
chai.use(chaiAsPromised);

/* tslint:disable no-unused-expression */
describe("Testing encryption service", () => {
  let knex: Knex;
  before(() => {
    const dbconfig = dbConfig();
    const knexInitializer = new KnexInitializer(dbconfig);
    knex = knexInitializer.getKnexInstance();
  });
  after(() => {
    knex.destroy();
  });
  it("should encrypt and decrypt secret", async function () {
    const secret = new Secret(
      "a9133087-3a17-4f99-a50c-247e84ab66da",
      "test",
      undefined,
      "test",
      "2022-03-07"
    );
    const encrypter = new AES256EncryptServiceMySQL(knex);
    await encrypter.encryptSecret(secret);
    const sec = await encrypter.decryptSecret(secret);
    expect(sec.message).to.be.equals("test");
  });
  //https://www.chaijs.com/plugins/chai-as-promised/
  it("should not encrypt empty message", async function () {
    const secret = new Secret(
      "a9133087-3a17-4f99-a50c-247e84ab66da",
      "",
      undefined,
      "test",
      "2022-03-07"
    );
    const encrypter = new AES256EncryptServiceMySQL(knex);
    await expect(encrypter.encryptSecret(secret)).to.eventually.rejectedWith(
      "Message empty"
    );
  });
});
