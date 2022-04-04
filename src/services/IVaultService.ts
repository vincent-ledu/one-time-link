import * as kdbxweb from "kdbxweb";

export interface IVaultService {
  createVault(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jsonObj: any[],
    password: kdbxweb.ProtectedValue,
    vaultName: string
  ): Promise<kdbxweb.Kdbx>;
}
