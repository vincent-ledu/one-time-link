import * as kdbxweb from "kdbxweb";
import * as argon2 from "../utils/argon2";
import Logger from "../utils/logger";
import { IVaultService } from "./IVaultService";
import { Knex } from "knex";
import { Constants } from "../domain/Constants";
import "dotenv/config";

export class KdbxVaultService implements IVaultService {
  counterTable = Constants.TABLE_NAMES.COUNTER;
  knex: Knex;
  groupNames: string[];
  passwordNames: string[];
  titleNames: string[];
  usernameNames: string[];
  constructor(knex: Knex) {
    kdbxweb.CryptoEngine.setArgon2Impl(argon2.argon2);
    this.knex = knex;
    if (process.env.KP_GROUPS) {
      this.groupNames = process.env.KP_GROUPS.split(",");
    } else {
      this.groupNames = ["GROUP", "GROUPE", "GRP"];
    }
    if (process.env.KP_PASSWORD) {
      this.passwordNames = process.env.KP_PASSWORDS.split(",");
    } else {
      this.passwordNames = [
        "PASSWORD",
        "MOT DE PASSE",
        "PASSE",
        "PASS",
        "PWD",
        "MDP",
      ];
    }
    if (process.env.KP_TITLES) {
      this.titleNames = process.env.KP_TITLES.split(",");
    } else {
      this.titleNames = ["TITLE", "TITRE", "LIBELLE", "DESCRIPTION"];
    }
    if (process.env.KP_USERNAMES) {
      this.usernameNames = process.env.KP_USERNAMES.split(",");
    } else {
      this.usernameNames = ["LOGIN", "USERNAME", "USER", "UTILISATEUR"];
    }
  }

  upCounter = async (counterName: string, inc?: number): Promise<void> => {
    if (this.knex) {
      const total = await this.knex(this.counterTable)
        .where("counterName", "=", counterName)
        .count("counter as c");
      if (total[0].c === 0) {
        await this.knex(this.counterTable).insert({
          counterName: counterName,
        });
      }
      await this.knex(this.counterTable)
        .where("counterName", "=", counterName)
        .increment("counter", inc ? inc : 1)
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
    let hasPasswordColumn = false;
    let hasUserNameColumn = false;
    let hasTitleColumn = false;
    this.upCounter("KeepassEntries", jsonObj.length);
    jsonObj.forEach((row) => {
      const groupKeys = Object.keys(row).filter((key) => {
        for (let i = 0; i < this.groupNames.length; i++) {
          if (
            new RegExp("^" + this.groupNames[i] + "[0-9]*").test(
              key.toUpperCase()
            )
          ) {
            return true;
          }
        }
        return false;
      });
      let group = db.getDefaultGroup();
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
      }
      const entry = db.createEntry(group);
      let passwordDefined = Object.prototype.hasOwnProperty.call(
        row,
        "Password"
      )
        ? true
        : false;
      let userDefined = Object.prototype.hasOwnProperty.call(row, "UserName")
        ? true
        : false;
      let titleDefined = Object.prototype.hasOwnProperty.call(row, "Title")
        ? true
        : false;
      for (const [key, value] of Object.entries(row)) {
        if (
          !passwordDefined &&
          this.passwordNames.includes(key.toUpperCase())
        ) {
          entry.fields.set(
            "Password",
            kdbxweb.ProtectedValue.fromString(String(value))
          );
          passwordDefined = true;
        } else if (
          !titleDefined &&
          this.titleNames.includes(key.toUpperCase())
        ) {
          entry.fields.set("Title", String(value));
          titleDefined = true;
        } else if (
          !userDefined &&
          this.usernameNames.includes(key.toUpperCase())
        ) {
          entry.fields.set("UserName", String(value));
          userDefined = true;
        } else {
          if (this.passwordNames.includes(key.toUpperCase())) {
            entry.fields.set(
              key,
              kdbxweb.ProtectedValue.fromString(String(value))
            );
          }
          entry.fields.set(key, String(value));
        }
      }
    });
    this.upCounter("KeepassCreated");
    return new Promise((resolve) => resolve(db));
  };
}
