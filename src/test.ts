import * as kdbxweb from "kdbxweb";
import * as argon2 from "./utils/argon2";
import fs from "fs";

async function test(filename: string, password: string) {
  kdbxweb.CryptoEngine.setArgon2Impl(argon2.argon2);
  fs.readFile(
    filename,
    null,
    (err: any, dataAsArrayBuffer: { buffer: ArrayBuffer }) => {
      const credentials = new kdbxweb.Credentials(
        kdbxweb.ProtectedValue.fromString(password)
      );

      kdbxweb.Kdbx.load(dataAsArrayBuffer.buffer, credentials).then((db) => {
        const group = db.getDefaultGroup();
        for (const entry of group.allEntries()) {
          console.log(...entry.fields);
        }
      });
    }
  );
}

test("/home/vincent/Downloads/vault.kdbx", "test");
