import config from "config";

import { app } from "#src/apps/api/app.js";
import { logger } from "#src/logger/logger.js";
import { addHook } from "#src/utils/process.js";

const log = logger("api");
const { host, port } = config.get("apps.api");

const server = app().listen(port, host, () => {
  log.info({ host, port }, "Serving");
});

addHook({
  async handler() {
    await new Promise((resolve) => {
      server.once("close", resolve).close();
    });
  },
  name: "api",
});
