// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
require("dotenv").config();

const TABLE_NAMES = {
  SECRETS: (process.env.DB_TABLE_PREFIX || "") + "secrets",
  COUNTER: (process.env.DB_TABLE_PREFIX || "") + "counter",
};
exports.TABLE_NAMES = TABLE_NAMES;
