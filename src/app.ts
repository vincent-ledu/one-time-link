import express from "express";
import morgan from "morgan";
import "dotenv/config";
import Logger from "./utils/logger";
import { SecretRoute } from "./routes/SecretRoutes";
import { DashboardRoute } from "./routes/DashboardRoute";
import { AES256EncryptServiceFile } from "./services/AES256EncryptionServiceFile";
import { FileDashboardService } from "./services/FileDashboardService";
import { HomeRoute } from "./routes/HomeRoute";
import KnexInitializer from "./utils/KnexInitializer";
import dbConfig, { DbType } from "./utils/DbConfig";
import { IEncryptService } from "./services/IEncryptService";
import { AES256EncryptServiceMySQL } from "./services/AES256EncryptionServiceMySQL";
import { IDashboardService } from "./services/IDashboardService";
import { MySQLDashboardService } from "./services/MySQLFileDashboardService";

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

  app.use(express.json());
  app.use(morgan("combined"));
  app.use(express.urlencoded());

  const databaseConfig = dbConfig();
  const knexInitializer = new KnexInitializer(databaseConfig);
  const knex = knexInitializer.getKnexInstance();
  let encryptService: IEncryptService;
  let dashboardService: IDashboardService;
  if (databaseConfig.dbType !== DbType.IN_MEMORY && knex !== undefined) {
    await knexInitializer.migrate();
    encryptService = new AES256EncryptServiceMySQL(knex);
    dashboardService = new MySQLDashboardService(knex);
  } else {
    encryptService = new AES256EncryptServiceFile(process.env.DATA_DIR);
    dashboardService = new FileDashboardService(process.env.DATA_DIR);
  }
  const dashboardRoute = new DashboardRoute(dashboardService);
  const secretRoute = new SecretRoute(encryptService);
  const homeRoute = new HomeRoute();
  app.use("/", homeRoute.router);
  app.use("/secret", secretRoute.router);
  app.use("/dashBoard", dashboardRoute.router);

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
