#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

/* eslint-disable @typescript-eslint/naming-convention */

import process from "node:process";

import sql, { Database } from "@leafac/sqlite";
import build from "pino-abstract-transport";
import config from "config";
import pump from "pump";

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

const isJson = (data: unknown) => {
  try {
    return typeof JSON.parse(data as string) === "object";
  } catch {
    return false;
  }
};

const transporter = ({ name, component }: { name: string; component?: string }) => {
  const db = new Database(config.get("database.path"))
    .execute(sql`pragma journal_mode = WAL`)
    .execute(sql`pragma busy_timeout = 5000`)
    .execute(sql`pragma foreign_keys = ON`);
  let shouldClose = false;
  let closeTimeout: NodeJS.Timeout | undefined;

  process.once("SIGINT", () => {
    shouldClose = true;
  });

  process.once("SIGTERM", () => {
    shouldClose = true;
  });

  return (build as any as typeof build.default)(
    async (source) => {
      for await (const object of source) {
        if (!db.open) break;
        if (!isJson(object)) continue;

        const objectParsed = JSON.parse(object as string) as { level: number; msg: string; time: number };

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
          (${row.name}, ${logLevels.labels[row.level as keyof (typeof logLevels)["labels"]]}, ${row.message}, ${
          row.timestamp
        }, ${row.data})
        `);

        if (shouldClose) {
          clearTimeout(closeTimeout);

          closeTimeout = setTimeout(() => {
            db.close();
          }, 1000);
        }
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

pump(process.stdin, transporter({ name: "log-harnest" }));
