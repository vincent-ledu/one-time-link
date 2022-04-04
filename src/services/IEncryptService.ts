import { Secret } from "../domain/Secret";

export interface IEncryptService {
  getCipherKey(password: string): Buffer;
  // https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e
  encryptSecret(secret: Secret): Promise<void>;
  decryptSecret(secret: Secret, unlink: boolean): Promise<Secret>;
}
