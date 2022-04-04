import * as kdbxweb from "kdbxweb";
import * as argon2 from "../utils/argon2";
import { IVaultService } from "./IVaultService";

export class KdbxVaultService implements IVaultService {
  private searchGroupByName(db: kdbxweb.Kdbx, groupName: string) {
    const root = db.getDefaultGroup();
    for (const group of root.allGroups()) {
      if (group.name === groupName) {
        return group;
      }
    }
    return undefined;
  }

  async createVault(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jsonObj: any[],
    password: kdbxweb.ProtectedValue,
    vaultName: string
  ) {
    kdbxweb.CryptoEngine.setArgon2Impl(argon2.argon2);
    const credentials = new kdbxweb.KdbxCredentials(password);
    const db = kdbxweb.Kdbx.create(credentials, vaultName);
    jsonObj.forEach((row) => {
      const groupKeys = Object.keys(row).filter((key) =>
        ["GROUP", "GROUPE", "GRP", "ADABO"].includes(key.toUpperCase())
      );
      let group = db.getDefaultGroup();
      let entry;
      if (groupKeys.length > 0) {
        for (let i = 0; i < groupKeys.length; i += 1) {
          const groupFound = this.searchGroupByName(db, row[groupKeys[i]]);
          if (!groupFound) {
            group = db.createGroup(group, row[groupKeys[i]]);
          } else {
            group = groupFound;
          }
          if (i === groupKeys.length - 1) {
            entry = db.createEntry(group);
          }
        }
      } else {
        entry = db.createEntry(group);
      }
      for (const [key, value] of Object.entries(row)) {
        if (
          ["PASSWORD", "MOT DE PASSE", "PASSE", "PASS", "PWD", "MDP"].includes(
            key.toUpperCase()
          )
        ) {
          entry.fields.set(
            "Password",
            kdbxweb.ProtectedValue.fromString(String(value))
          );
        } else if (
          ["GROUP", "GROUPE", "GRP", "ADABO"].includes(key.toUpperCase())
        ) {
          // do nothing
        } else if (
          ["TITLE", "TITRE", "LIBELLE", "DESCRIPTION"].includes(
            key.toUpperCase()
          )
        ) {
          entry.fields.set("Title", String(value));
        } else if (
          ["LOGIN", "USERNAME", "USER", "UTILISATEUR"].includes(
            key.toUpperCase()
          )
        ) {
          entry.fields.set("Username", String(value));
        } else {
          entry.fields.set(key, String(value));
        }
      }
    });
    return db;
  }
}
