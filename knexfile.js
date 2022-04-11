/**
 * This configuration file for Knex is used only for running Knex in command line
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
require("dotenv").config();

const connection = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 4406,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "one-time-link-db",
};
const config = {
  client: "mysql",
  connection: connection,
  useNullAsDefault: true,
  migrations: {
    tableName: (process.env.DB_TABLE_PREFIX || "") + "migrations",
  },
};

module.exports = config;
