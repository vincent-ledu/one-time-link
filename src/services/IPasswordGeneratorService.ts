export interface IPasswordGeneratorService {
  generatePassword(
    length: number,
    numbers: boolean,
    symbols: boolean,
    strict: boolean
  ): string;
}
