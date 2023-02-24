import sql from "@leafac/sqlite";

import * as logResolvers from "#src/core/resolvers/log-resolvers.js";
import { type Log, LogAggregatorDestination } from "./log-aggregator-destination.js";
import { db } from "#src/database/db.js";
import { join } from "#src/utils/sql.js";

export class DatabaseLogAggregatorDestination extends LogAggregatorDestination {
  #logToDb({ name, maps, raw, timestamp }: Log) {
    return {
      name: logResolvers.resolveName(raw, maps, name),
      level: logResolvers.resolveLevel(raw, maps, "info"),
      timestamp: logResolvers.resolveTimestamp(raw, maps, timestamp),
      message: logResolvers.resolveMessage(raw, maps, raw?.message ?? raw?.msg ?? ""),
      data: JSON.stringify(raw ?? {}),
    };
  }

  async write(logs: Log | Log[]) {
    if (!db.open) return;

    if (!Array.isArray(logs)) logs = [logs];
    if (logs.length <= 0) return;

    const values = logs
      .map((log) => this.#logToDb(log))
      .map(
        ({ name, level, message, timestamp, data }) =>
          sql`(${name}, ${level}, ${message}, ${timestamp.toISOString()}, ${data})`,
      );

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
