import generator from "generate-password";
import { Counter } from "../domain/Counter";
import { IPasswordGeneratorService } from "./IPasswordGeneratorService";

export class PasswordGeneratorService implements IPasswordGeneratorService {
  generatePassword = (
    length: number,
    numbers: boolean,
    symbols: boolean,
    strict: boolean
  ): string => {
    return generator.generate({
      length,
      numbers,
      symbols,
      strict,
    });
  };
}
