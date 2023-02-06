#!/usr/bin/env node

import { logger } from "#src/logger/logger.js";
import { run } from "#src/commands/migrate.js";

const log = logger("migrate-command");

try {
  log.info("Running command");
  await run();
} catch (error) {
  log.error(error, "Error while running command");
} finally {
  log.info("Command runned");
}
