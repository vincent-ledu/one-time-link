import express from "express";
import morgan from "morgan";
import "dotenv/config";
import Logger from "./utils/logger";
import { SecretRoute } from "./routes/SecretRoutes";
import { HomeRoute } from "./routes/HomeRoute";
import { AES256EncryptService } from "./services/AES256EncryptionService";
import { HomeController } from "./controller/HomeController";

const app = express();
app.set("view engine", "ejs");

app.use(express.json());
app.use(morgan("combined"));
app.use(express.urlencoded());
const encryptService = new AES256EncryptService(process.env.DATA_DIR);
const secretRoute = new SecretRoute(encryptService);
const homeRoute = new HomeRoute();
app.use("/secret", secretRoute.router);
app.use("/", homeRoute.router);

Logger.info(`Loading ${process.env.NODE_ENV} configuration`);

export default app;
