import sql from "@leafac/sqlite";

import { LogAggregatorDestination } from "./log-aggregator-destination.js";
import { db } from "#src/core/database/db.js";
import { join } from "#src/utils/sql.js";

export class DatabaseLogAggregatorDestination extends LogAggregatorDestination {
  async write(logs) {
    if (!Array.isArray(logs)) logs = [logs];
    if (logs.length <= 0) return;

    db.run(sql`
      insert into "logs"
      ("name", "level", "message", "timestamp", "data")
      values
      $${join(
        logs.map(
          ({ name, level, timestamp, message, data }) => sql`(${name}, ${level}, ${message}, ${timestamp}, ${data})`,
        ),
        sql`,`,
      )}
    `);
  }
}
