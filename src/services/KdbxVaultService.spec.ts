import { KdbxVaultService } from "./KdbxVaultService";
import csv from "csvtojson";
import { expect } from "chai";
import { ProtectedValue } from "kdbxweb";

describe("KdbxManager test suite", () => {
  it("should create a simple kdbx", async () => {
    const csvStr = "Login,pwd,Base\nmonlogin,pwd,totodb";
    const jsonObj = await csv().fromString(csvStr);
    const kdbxService = new KdbxVaultService(undefined);

    const db = await kdbxService.createVault(
      jsonObj,
      ProtectedValue.fromString("secret123"),
      "mykeepass"
    );
    expect(db.groups.length).to.be.equals(1);
  });
  it("should create a kdbx with 1 group depth", async () => {
    const csvStr = "Login,pwd,Base,groupe\nmonlogin,pwd,totodb,db";
    const jsonObj = await csv().fromString(csvStr);
    const kdbxService = new KdbxVaultService(undefined);

    const db = await kdbxService.createVault(
      jsonObj,
      ProtectedValue.fromString("secret123"),
      "mykeepass"
    );
    expect(db.getDefaultGroup().groups[0].name === "Recycle Bin");
    expect(db.getDefaultGroup().groups[1].name === "db");
    expect(
      db.getDefaultGroup().groups[1].entries[0].fields.get("UserName") ===
        "monlogin"
    );
  });
});
