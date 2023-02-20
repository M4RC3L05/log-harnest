import config from "config";

import { addHook } from "#src/utils/process.js";
import { app } from "#src/apps/dashboard/app.js";
import { logger } from "#src/core/logger/logger.js";

const log = logger("dashboard");
const { host, port } = config.get("apps.dashboard");

const server = app().listen(port, host, () => {
  log.info({ host, port }, "Serving");
});

addHook({
  async handler() {
    await new Promise((resolve) => {
      server.once("close", resolve).close();
    });
  },
  name: "dashobard",
});
