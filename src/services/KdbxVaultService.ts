import * as kdbxweb from "kdbxweb";
import * as argon2 from "../utils/argon2";
import Logger from "../utils/logger";
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
      Logger.debug(`groupKeys: ${groupKeys}`);
      let group = db.getDefaultGroup();
      let entry;
      if (groupKeys.length > 0) {
        for (let i = 0; i < groupKeys.length; i += 1) {
          const groupFound = group.groups.filter(
            (g) => g.name === row[groupKeys[i]]
          );
          if (!groupFound || groupFound.length == 0) {
            group = db.createGroup(group, row[groupKeys[i]]);
          } else {
            group = groupFound[0];
          }
        }
        entry = db.createEntry(group);
      } else {
        entry = db.createEntry(group);
        Logger.debug(
          `creating entry in ${group.name} from ${group.parentGroup.name}`
        );
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
          entry.fields.set("UserName", String(value));
        } else {
          entry.fields.set(key, String(value));
        }
      }
    });
    return db;
  }
}
