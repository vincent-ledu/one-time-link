import { knex, Knex } from "knex";
import { DbConfig, DbType } from "./DbConfig";
import logger from "./logger";
import VError from "verror";

export default class KnexInitializer {
  private knex: Knex | undefined;

  constructor(dbConfig: DbConfig) {
    if (dbConfig.dbType === DbType.IN_MEMORY) {
      logger.info("Setting database mode to IN MEMORY");
    } else {
      logger.info("Setting database mode to MYSQL");
      this.initKnex(dbConfig);
    }
  }

  private initKnex(databaseConfig: DbConfig): void {
    logger.info("Initializing Knex", { dbType: DbType[databaseConfig.dbType] });
    if (databaseConfig.dbType === DbType.MYSQL) {
      const connection: Knex.MySqlConnectionConfig = {
        host: databaseConfig.dbHost,
        user: databaseConfig.dbUser,
        port: databaseConfig.dbPort,
        password: databaseConfig.dbPassword,
        database: databaseConfig.dbName,
      };

      this.knex = knex({
        client: "mysql",
        connection: connection,
        useNullAsDefault: true,
        migrations: {
          tableName: "migrations",
        },
      });
    } else if (databaseConfig.dbType === DbType.SQLITE) {
      this.knex = knex({
        client: "sqlite3",
        connection: {
          filename: ":memory:",
        },
        useNullAsDefault: true,
      });
    } else {
      this.knex = undefined;
    }
  }

  public getKnexInstance(): Knex | undefined {
    return this.knex;
  }

  public async migrate(): Promise<any> {
    if (this.knex) {
      try {
        logger.info("Starting Database Migrations");
        await this.knex.migrate.latest();
        logger.info("Finished Database Migrations");
      } catch (error) {
        logger.error("Error while migrating DB", error);
        process.exit(1);
      }
    } else {
      throw new VError("knex is undefined");
    }
  }
}
