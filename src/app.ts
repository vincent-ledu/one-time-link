import express from "express";
import morgan from "morgan";
import "dotenv/config";
import Logger from "./utils/logger";
import { SecretRoute } from "./routes/SecretRoutes";
import { DashboardRoute } from "./routes/DashboardRoute";
import { AES256EncryptService } from "./services/AES256EncryptionService";
import { FileDashboardService } from "./services/FileDashboardService";
import { HomeRoute } from "./routes/HomeRoute";

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.json());
app.use(morgan("combined"));
app.use(express.urlencoded());
const encryptService = new AES256EncryptService(process.env.DATA_DIR);
const secretRoute = new SecretRoute(encryptService);
const homeRoute = new HomeRoute();
const dashboardRoute = new DashboardRoute(
  new FileDashboardService(process.env.DATA_DIR)
);
app.use("/", homeRoute.router);
app.use("/secret", secretRoute.router);
app.use("/dashBoard", dashboardRoute.router);

Logger.info(`Loading ${process.env.NODE_ENV} configuration`);

export default app;
