#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import { logger } from "#src/core/logger/logger.js";
import { run } from "#src/commands/migrate.js";

const log = logger("migrate-command");

try {
  log.info("Running command");
  await run();
} catch (error: unknown) {
  log.error(error, "Error while running command");
} finally {
  log.info("Command runned");
}
