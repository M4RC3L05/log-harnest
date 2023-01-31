import sql, { Database } from "@leafac/sqlite";
import config from "config";

import { logger } from "#src/logger/logger.js";
import { onProcessSignals } from "#src/utils/process.js";

const log = logger("database");

export const db = new Database(config.get("database.path"), {
  verbose: (sql, ...args) => log.debug(sql, ...args),
})
  .execute(sql`pragma journal_mode = WAL`)
  .execute(sql`pragma busy_timeout = 5000`)
  .execute(sql`pragma foreign_keys = ON`);

onProcessSignals({
  signals: ["SIGINT", "SIGTERM"],
  handler() {
    db.close();

    log.info("Database connection closed");
  },
  name: "database",
});
