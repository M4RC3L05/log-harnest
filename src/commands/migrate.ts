import fs from "node:fs/promises";

import config from "config";

import { db } from "#src/database/db.js";

export const run = async () => {
  try {
    const migrationsDir = config.get<string>("database.migrations.path");
    const dirFiles = await fs.readdir(migrationsDir, { withFileTypes: true });
    const migrationsFiles = dirFiles.filter((file) => file.isFile() && file.name.endsWith(".sql"));
    const migrations = await Promise.all(
      migrationsFiles.map((file) => async () => {
        db.exec(await fs.readFile(`${migrationsDir}/${file.name}`, { encoding: "utf8" }));
      }),
    );

    await db.migrate(...migrations);
  } finally {
    db.close();
  }
};
