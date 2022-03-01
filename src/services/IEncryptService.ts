import { Secret } from "../domain/Secret";
import { SecretRoute } from "../routes/SecretRoutes";

export interface IEncryptService {
  //https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e
  // encryptFile(folder: string, file: string, password: string): void;
  // decryptFile(folder: string, file: string, password: string): void;
  // encryptMessage(folder: string, text: string, password: string): void;
  // decryptMessage(folder: string, password: string): Promise<string>;
  encryptSecret(secret: Secret): void;
  decryptSecret(secret: Secret, unlink: boolean): Promise<Secret>;
}