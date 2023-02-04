import { app } from "#src/apps/source-watcher/app.js";
import { addHook } from "#src/utils/process.js";

const watcher = app();

addHook({
  async handler() {
    await watcher.close();
  },
  name: "source-watcher",
});
