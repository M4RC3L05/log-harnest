import process from "node:process";

import { app } from "#src/apps/source-watcher/app.js";
import { logger } from "#src/logger/logger.js";
import { onProcessSignals } from "#src/utils/process.js";

const log = logger("source-watcher");

const watcher = app();

process.addListener("uncaughtException", (error) => {
  log.error(error, "Uncaught exception");

  process.emit("SIGUSR2");
});

process.addListener("unhandledRejection", (reason, promise) => {
  log.error({ reason, promise }, "Unhandled rejection");

  process.emit("SIGUSR2");
});

onProcessSignals({
  handler() {
    watcher.close();

    log.info("source-watcher closed");
  },
  name: "source-watcher",
  signals: ["SIGINT", "SIGTERM"],
});
