import sql from "@leafac/sqlite";

import { btw, eq, lk } from "#src/utils/sql.js";
import { db } from "#src/database/db.js";
import { resolveLogName } from "#src/resolvers/log-resolvers.js";

export class GetLogsMissingTimeRangeError extends Error {
  constructor(message) {
    super(message);
    this.code = "get-logs-missing-time-range-error";
  }
}
export class GetLogsTimeRangeToLargeError extends Error {
  constructor(message) {
    super(message);
    this.code = "get-logs-time-range-to-large-error";
  }
}

export const getLogs = ({ from, to, name, message, level } = {}) => {
  if (!from && !to) {
    throw new GetLogsMissingTimeRangeError("Missing `from` or `to`");
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
    throw new GetLogsTimeRangeToLargeError(
      `\`from\` and \`to\` distance is to large, max distance is ${maxDistance}ms but ${currentDistance}ms given`,
    );
  }

  if (level) {
    level = resolveLogName(Number(level));
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
