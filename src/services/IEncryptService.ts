import { Secret } from "../domain/Secret";
import { SecretRoute } from "../routes/SecretRoutes";

export interface IEncryptService {
  getCipherKey(password: string): Buffer;
  // https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e
  encryptFile(folder: string, file: string, password: string): Promise<void>;
  decryptFile(folder: string, file: string, password: string): Promise<void>;
  encryptMessage(folder: string, text: string, password: string): Promise<void>;
  decryptMessage(folder: string, password: string): Promise<string>;
  encryptSecret(secret: Secret): Promise<void>;
  decryptSecret(secret: Secret, unlink: boolean): Promise<Secret>;
}
