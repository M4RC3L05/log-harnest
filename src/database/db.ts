import sql, { Database } from "@leafac/sqlite";
import config from "config";

import { addHook } from "#src/utils/process.js";
import { logger } from "#src/core/logger/logger.js";

const log = logger("database");

export const db = new Database(config.get("database.path"), {
  verbose(sql: string, ...args) {
    log.debug({ args }, sql);
  },
})
  .execute(sql`pragma journal_mode = WAL`)
  .execute(sql`pragma busy_timeout = 5000`)
  .execute(sql`pragma foreign_keys = ON`);

addHook({
  handler() {
    db.close();
  },
  name: "database",
});
