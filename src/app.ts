import express from "express";
import "dotenv/config";
import Logger from "./utils/logger";
import { SecretRoute } from "./routes/SecretRoutes";
import { DashboardRoute } from "./routes/DashboardRoute";
import { AES256EncryptServiceFile } from "./services/AES256EncryptionServiceFile";
import { HomeRoute } from "./routes/HomeRoute";
import KnexInitializer from "./utils/KnexInitializer";
import dbConfig, { DbType } from "./utils/DbConfig";
import { IEncryptService } from "./services/IEncryptService";
import { AES256EncryptServiceMySQL } from "./services/AES256EncryptionServiceMySQL";
import { MySQLDashboardService } from "./services/MySQLFileDashboardService";
import { KdbxVaultService } from "./services/KdbxVaultService";
import { VaultRoute } from "./routes/VaultRoute";
import { I18n } from "i18n";
import path from "path";
import { IVaultService } from "./services/IVaultService";

export interface App {
  stop: () => Promise<void>;
}

if (process.env.NODE_ENV !== "test") {
  startApp().then(() => {
    Logger.info("Server started");
  });
}

export async function startApp(): Promise<App> {
  const app = express();
  app.set("view engine", "ejs");
  app.use(express.static("public"));

  const i18n = new I18n();
  i18n.configure({
    locales: ["en", "fr"],
    directory: path.join(__dirname, "../locales"),
    defaultLocale: "en",
  });

  app.use(express.json());
  app.use(express.urlencoded());
  app.use(i18n.init);

  //#region Database
  const databaseConfig = dbConfig();
  const knexInitializer = new KnexInitializer(databaseConfig);
  const knex = knexInitializer.getKnexInstance();
  //#endregion
  //#region Services
  let encryptService: IEncryptService;
  let vaultService: IVaultService;
  if (databaseConfig.dbType === DbType.MYSQL && knex !== undefined) {
    await knexInitializer.migrate();
    vaultService = new KdbxVaultService(knex);
    encryptService = new AES256EncryptServiceMySQL(knex);
  } else {
    vaultService = new KdbxVaultService(undefined);
    encryptService = new AES256EncryptServiceFile(process.env.DATA_DIR);
  }
  //#endregion
  //#region Routes
  const vaultRoute = new VaultRoute(vaultService);
  if (databaseConfig.dbType === DbType.MYSQL && knex !== undefined) {
    const dashboardService = new MySQLDashboardService(knex);
    const dashboardRoute = new DashboardRoute(dashboardService);
    app.use("/dashBoard", dashboardRoute.router);
  }
  const secretRoute = new SecretRoute(encryptService);
  const homeRoute = new HomeRoute();
  app.use("/", homeRoute.router);
  app.use("/secret", secretRoute.router);
  app.use("/vault", vaultRoute.router);
  //#endregion
  Logger.info(`Loading ${process.env.NODE_ENV} configuration`);
  const PORT = process.env.SERVER_PORT
    ? parseInt(process.env.SERVER_PORT, 10)
    : 3000;

  const server = app.listen(PORT, () => {
    Logger.info(`App listening on port ${PORT}!`);
  });

  const stopApp = async (): Promise<void> => {
    await server.close();
    await knex?.destroy();
  };

  return {
    stop: stopApp,
  };
}
