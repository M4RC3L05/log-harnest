import process from "node:process";

import { logger } from "#src/logger/logger.js";

/**
 * @typedef { Object } ProcessSignals
 * @property { NodeJS.Signals[] } signals
 * @property { string } name
 * @property { () => Promise<void> | void } handler
 */

/**
 * @typedef { Object } OnSignal
 * @property { NodeJS.Signals } signal
 * @property { string } name
 * @property { () => Promise<void> | void } handler
 */

const log = logger("process");

/**
 * @param { OnSignal } params
 */
const onSignal = ({ handler, signal, name }) => {
  return async () => {
    log.info({ handlerName: name }, `Running handlers for signal "${signal}"`);

    try {
      await handler();

      log.info({ handlerName: name }, `Handler successfull for "${signal}"`);
    } catch (error) {
      log.error(error, `Handler error for "${signal}" @ "${name}"`);
    }
  };
};

/**
 * @param { ProcessSignals } params
 */
export const onProcessSignals = ({ handler, signals, name }) => {
  log.info({ signals, handlerName: name }, "Register for signal");

  for (const signal of signals) {
    process.once(signal, onSignal({ signal, handler, name }));
  }
};
