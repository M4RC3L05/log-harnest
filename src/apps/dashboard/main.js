import process from "node:process";

import config from "config";

import { app } from "#src/apps/dashboard/app.js";
import { logger } from "#src/logger/logger.js";
import { onProcessSignals } from "#src/utils/process.js";

const log = logger("dashboard");
const { host, port } = config.get("apps.dashboard");

const server = app().listen(port, host, () => {
  log.info("Serving");
});

process.addListener("uncaughtException", (error) => {
  log.error(error, "Uncaught exception");

  process.emit("SIGUSR2");
});

process.addListener("unhandledRejection", (reason, promise) => {
  log.error({ reason, promise }, "Unhandled rejection");

  process.emit("SIGUSR2");
});

onProcessSignals({
  async handler() {
    await new Promise((resolve) => {
      server.once("close", resolve).close();
    });
  },
  name: "api",
  signals: ["SIGINT", "SIGTERM", "SIGUSR2"],
});
