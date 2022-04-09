const Constants = require("../Constants");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return knex(Constants.TABLE_NAMES.COUNTER)
    .select()
    .where("counterName", "KeepassEntrie")
    .then(function (rows) {
      if (rows.length === 0) {
        return knex(Constants.TABLE_NAMES.COUNTER).insert([
          {
            counterName: "KeepassEntries",
            counter: 0,
          },
        ]);
      }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex(Constants.TABLE_NAMES.COUNTER)
    .delete()
    .where("counterName", "=", "KeepassEntries");
};
