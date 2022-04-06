const Constants = require("../Constants");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable(Constants.TABLE_NAMES.COUNTER, function (t) {
    t.string("counterName").notNull();
    t.bigInteger("counter").notNull().defaultTo(0);
    t.timestamp("createdAt").notNull().defaultTo(knex.fn.now());
    t.timestamp("updatedAt")
      .notNull()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
  return knex(Constants.TABLE_NAMES.COUNTER).insert([
    {
      counterName: "SecretsEncrypted",
      counter: 0,
    },
    {
      counterName: "SecretsDecrypted",
      counter: 0,
    },
    {
      counterName: "KeepassCreated",
      counter: 0,
    },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(Constants.TABLE_NAMES.COUNTER);
};
