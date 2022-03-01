import express from "express";
import morgan from "morgan";
import "dotenv/config";
import Logger from "./utils/logger";
import { SecretRoute } from "./routes/SecretRoutes";
import { AES256EncryptService } from "./services/AES256EncryptionService";

const app = express();
app.use(express.json());
app.use(morgan("combined"));
const encryptService = new AES256EncryptService(process.env.DATA_DIR);
const secretRoute = new SecretRoute(encryptService);
app.use("/secret", secretRoute.router);

Logger.info(`Loading ${process.env.NODE_ENV} configuration`);

export default app;
