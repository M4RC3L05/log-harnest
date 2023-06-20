import process from "node:process";

import sql, { Database } from "@leafac/sqlite";
import build from "pino-abstract-transport";
import config from "config";

export const logLevels = {
  labels: {
    0: "all",
    10: "trace",
    20: "debug",
    30: "info",
    40: "warn",
    50: "error",
    60: "fatal",
    70: "off",
  },
};

const isJson = (data) => {
  try {
    return typeof JSON.parse(data) === "object";
  } catch {
    return false;
  }
};

const transporter = ({ name, component }) => {
  const db = new Database(config.get("database.path"))
    .execute(sql`pragma journal_mode = WAL`)
    .execute(sql`pragma busy_timeout = 5000`)
    .execute(sql`pragma foreign_keys = ON`);

  process.once("SIGINT", () => {
    db.close();
  });

  process.once("SIGTERM", () => {
    db.close();
  });

  return build(
    async (source) => {
      for await (const object of source) {
        if (!isJson(object)) continue;

        // Output object
        console.log(object);

        const objectParsed = JSON.parse(object);

        const row = {
          name,
          level: objectParsed.level,
          message: objectParsed.msg,
          timestamp: new Date(objectParsed.time).toISOString(),
          data: JSON.stringify({ ...objectParsed, component }),
        };

        if (!db.open) break;

        db.run(sql`
          insert into "logs"
          ("name", "level", "message", "timestamp", "data")
          values
          (${row.name}, ${logLevels.labels[row.level]}, ${row.message}, ${row.timestamp}, ${row.data})
        `);
      }
    },
    {
      parse: "lines",
      close(_, cb) {
        if (db.open) db.close();

        cb();
      },
    },
  );
};

export default transporter;
