import process from "node:process";
import { promisify } from "node:util";

import config from "config";

import { addHook } from "#src/utils/process.js";
import { app } from "#src/apps/dashboard/app.js";
import { logger } from "#src/core/logger/logger.js";

const log = logger("dashboard");
const { host, port } = config.get<{ host: string; port: number }>("apps.dashboard");

const server = app().listen(port, host, () => {
  log.info({ host, port }, "Serving");

  if (typeof process.send === "function") {
    log.info("Sending ready signal");

    process.send("ready");
  }
});
const pClose = promisify<void>(server.close).bind(server);

server.addListener("close", () => {
  log.info("Server closed");
});

addHook({
  async handler() {
    await pClose().catch((error) => {
      log.error(error, "Could not close server");
    });
  },
  name: "dashboard",
});
