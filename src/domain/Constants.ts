import "dotenv/config";

export class Constants {
  static readonly TABLE_NAMES = {
    COUNTER: process.env.DB_TABLE_PREFIX + "counter",
    SECRETS: process.env.DB_TABLE_PREFIX + "secrets",
  };
}
