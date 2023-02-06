import sql from "@leafac/sqlite";

import { db } from "#src/core/database/db.js";

export const getLogNames = () => {
  return db.all(sql`select distinct "name" from "main"."logs"`);
};
