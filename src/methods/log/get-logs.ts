import sql from "@leafac/sqlite";

import { MissingTimeRangeError, TimeRangeToBigError } from "#src/core/errors/mod.js";
import { btw, eq, lk } from "#src/utils/sql.js";
import { db } from "#src/database/db.js";
import { resolveLogName } from "#src/core/resolvers/log-resolvers.js";

export type GetLogsArgs = {
  from?: string;
  to?: string;
  name?: string;
  message?: string;
  level?: string;
};

export const getLogs = ({ from, to, name, message, level }: GetLogsArgs) => {
  if (!from && !to) {
    throw new MissingTimeRangeError("Missing `from` or `to`");
  }

  if (!from) {
    from = new Date(new Date(String(to)).getTime() - 1000 * 60 * 10).toISOString();
    to = new Date(String(to)).toISOString();
  }

  if (!to) {
    to = new Date(new Date(String(from)).getTime() + 1000 * 60 * 10).toISOString();
    from = new Date(String(from)).toISOString();
  }

  to = new Date(String(to)).toISOString();
  from = new Date(String(from)).toISOString();

  const maxDistance = 1000 * 60 * 60 * 24 * 30;
  const currentDistance = Math.abs(new Date(String(to)).getTime() - new Date(String(from)).getTime());

  if (currentDistance > maxDistance) {
    throw new TimeRangeToBigError(
      `\`from\` and \`to\` distance is to big, max distance is ${maxDistance}ms but ${currentDistance}ms given`,
    );
  }

  if (level) {
    level = resolveLogName(Number(level) as any) as string;
  }

  return db.all(sql`
    select *
    from "main"."logs"
    where
      $${btw(sql`"timestamp"`, from, to)}
      $${name ? sql` and $${eq(sql`"name"`, name)}` : sql``}
      $${level ? sql` and $${eq(sql`"level"`, level)}` : sql``}
      $${message ? sql` and $${lk(sql`lower("message")`, `%${message}%`)}` : sql``}
    order by "timestamp" desc, "rowId" desc
  `);
};
