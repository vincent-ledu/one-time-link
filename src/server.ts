import app from "./app";
import "dotenv/config";
import logger from "./utils/logger";

const PORT = process.env.SERVER_PORT
  ? parseInt(process.env.SERVER_PORT, 10)
  : 3000;

app
  .listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
  })
  .on("error", (e) => logger.error(e));
