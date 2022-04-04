import { KdbxVaultService } from "./KdbxVaultService";
import csv from "csvtojson";
import { expect } from "chai";
import { ProtectedValue } from "kdbxweb";

describe("KdbxManager test suite", () => {
  it("should create a kdbx", () => {
    const csvStr = "ADABO,Login,pwd,Base\nZUDA0,monlogin,pwd,totodb";
    csv()
      .fromString(csvStr)
      .then((jsonObj) => {
        const kdbxService = new KdbxVaultService();

        kdbxService
          .createVault(
            jsonObj,
            ProtectedValue.fromString("secret123"),
            "mykeepass"
          )
          .then((db) => {
            expect(db.groups.length).to.be.equals(1);
          });
      });
  });
});
