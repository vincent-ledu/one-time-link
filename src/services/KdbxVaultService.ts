import * as kdbxweb from "kdbxweb";
import * as argon2 from "../utils/argon2";
import Logger from "../utils/logger";
import { IVaultService } from "./IVaultService";
import { Knex } from "knex";
import Constants from "../../Constants";

export class KdbxVaultService implements IVaultService {
  counterTable = Constants.TABLE_NAMES.COUNTER;
  knex: Knex;
  constructor(knex: Knex) {
    kdbxweb.CryptoEngine.setArgon2Impl(argon2.argon2);
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
  createVault = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jsonObj: any[],
    password: kdbxweb.ProtectedValue,
    vaultName: string
  ): Promise<kdbxweb.Kdbx> => {
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
    this.upCounter("KeepassCreated");
    return new Promise((resolve) => resolve(db));
  };
}
