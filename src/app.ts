import express from "express";
import morgan from "morgan";
import "dotenv/config";
import Logger from "./utils/logger";

const app = express();
app.use(express.json());
app.use(morgan("combined"));

Logger.info(`Loading ${process.env.NODE_ENV} configuration`);

export default app;
