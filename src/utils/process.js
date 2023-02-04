import process from "node:process";

import { logger } from "#src/logger/logger.js";

/**
 * @typedef { Object } ProcessHook
 * @property { string } name
 * @property { () => Promise<void> | void } handler
 */

const log = logger("process");
const /** @type { ProcessHook[] } */ processHooks = [];
const /** @type { NodeJS.Signals[] } */ signalsToWatch = ["SIGTERM", "SIGINT", "SIGUSR2"];
let shuttingDown = false;

/**
 * @param { ProcessHook } hook
 */
export const addHook = (hook) => {
  log.info(`Registered "${hook.name}" hook`);
  processHooks.push(hook);
};

/**
 * @param {NodeJS.Signals} signal
 */
const processSignal = async (signal) => {
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
    } catch (error) {
      log.error(error, `"${name}" hook unsuccessfully`);
    }
  }

  log.info({ signal }, "Exit signal process completed");
};

/**
 * @param {any} error
 */
const processErrors = (error) => {
  log.error(typeof error === "object" ? error : { error }, "Uncaught/Unhandled");

  if (shuttingDown) log.info("Ignoring Uncaught/Unhandled has the app is shutting down.");
  else process.emit("SIGUSR2");
};

process.on("uncaughtException", processErrors);
process.on("unhandledRejection", processErrors);

for (const signal of signalsToWatch) {
  process.on(signal, processSignal);
}
