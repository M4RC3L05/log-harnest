import process from "node:process";

import { logger } from "#src/core/logger/logger.js";

type Hook = {
  name: string;
  handler: () => Promise<void> | void;
};

const log = logger("process");
const processHooks: Hook[] = [];
const signalsToWatch = ["SIGTERM", "SIGINT", "SIGUSR2"];
let shuttingDown = false;

export const addHook = (hook: Hook) => {
  log.info(`Registered "${hook.name}" hook`);
  processHooks.push(hook);
};

const processSignal = async (signal: NodeJS.Signals) => {
  if (shuttingDown) {
    log.warn("Ignoring process exit signal has the app is shutting down.");
    return;
  }

  log.info({ signal }, "Processing exit signal");

  shuttingDown = true;

  for (const signal of signalsToWatch) process.removeListener(signal, processSignal);

  for (const { name, handler } of processHooks) {
    log.info(`Processing "${name}" hook`);

    try {
      // eslint-disable-next-line no-await-in-loop
      await handler();

      log.info(`"${name}" hook successfull`);
    } catch (error: unknown) {
      log.error(error, `"${name}" hook unsuccessfully`);
    }
  }

  log.info({ signal }, "Exit signal process completed");
};

const processErrors = (error: unknown) => {
  log.error(typeof error === "object" ? error : { error }, "Uncaught/Unhandled");

  if (shuttingDown) log.info("Ignoring Uncaught/Unhandled has the app is shutting down.");
  else process.emit("SIGUSR2");
};

process.on("uncaughtException", processErrors);
process.on("unhandledRejection", processErrors);

for (const signal of signalsToWatch) {
  process.on(signal, processSignal);
}
