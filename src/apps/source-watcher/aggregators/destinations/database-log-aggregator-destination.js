import sql from "@leafac/sqlite";

import * as logResolvers from "#src/core/resolvers/log-resolvers.js";
import { LogAggregatorDestination } from "./log-aggregator-destination.js";
import { db } from "#src/database/db.js";
import { join } from "#src/utils/sql.js";
import { logger } from "#src/core/logger/logger.js";

const log = logger("database-log-aggregator-destination");

export class DatabaseLogAggregatorDestination extends LogAggregatorDestination {
  #logToDB({ name, maps, raw, timestamp }) {
    try {
      const parsed = JSON.parse(raw);

      return {
        name: logResolvers.resolveName(parsed, maps, name),
        level: logResolvers.resolveLevel(parsed, maps, "info"),
        timestamp: logResolvers.resolveTimestamp(parsed, maps, timestamp),
        message: logResolvers.resolveMessage(parsed, maps, parsed?.message ?? parsed?.msg ?? ""),
        data: raw,
      };
    } catch (error) {
      log.error(error, "Unable to parse log");

      return false;
    }
  }

  async write(logs) {
    if (!Array.isArray(logs)) logs = [logs];
    if (logs.length <= 0) return;

    const values = logs
      .map((log) => this.#logToDB(log))
      .filter((log) => log !== false)
      .map(({ name, level, message, timestamp, data }) => sql`(${name}, ${level}, ${message}, ${timestamp}, ${data})`);

    if (values.length <= 0) {
      return;
    }

    db.run(sql`
      insert into "logs"
      ("name", "level", "message", "timestamp", "data")
      values
      $${join(values, sql`,`)}
    `);
  }
}
