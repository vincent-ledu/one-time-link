const Constants = require("../Constants");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(Constants.TABLE_NAMES.SECRETS, function (t) {
    t.string("id").primary();
    t.string("message").notNull();
    t.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(Constants.TABLE_NAMES.SECRETS);
};
