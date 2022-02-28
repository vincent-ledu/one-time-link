export interface IEncryptService {
  //https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e
  encryptFile(file: string, password: string): void;
  decryptFile(file: string, password: string): void;
  encryptMessage(text: string, password: string): void;
  decryptMessage(text: string, password: string): void;
}
