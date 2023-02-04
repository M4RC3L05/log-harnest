import cors from "@koa/cors";
import Router from "@koa/router";
import sql from "@leafac/sqlite";
import config from "config";
import Koa from "koa";
import basicAuth from "koa-basic-auth";

import { db } from "#src/database/index.js";
import { logLevels } from "#src/resolvers/log-resolvers.js";
import * as sqlUtils from "#src/utils/sql.js";

const { username, password } = config.get("apps.api.basicAuth");

export const app = () => {
  const koa = new Koa();
  const router = new Router({ prefix: "/api" });

  router.get("/logs/names", (ctx) => {
    const names = db.all(sql`
      select distinct "name"
      from "main"."logs"
    `);

    ctx.body = { data: names };
  });

  router.get("/logs", (ctx) => {
    let { from, to, name, message, level } = ctx.request.query;

    if (!from && !to) {
      ctx.throw(422, "Missing time range");
    }

    if (!from) {
      if (typeof to !== "string") ctx.throw(422, "Invalid to timestamp");

      from = new Date(new Date(String(to)).getTime() - 1000 * 60 * 10).toISOString();
      to = new Date(String(to)).toISOString();
    }

    if (!to) {
      if (typeof from !== "string") ctx.throw(422, "Invalid from timestamp");

      to = new Date(new Date(String(from)).getTime() + 1000 * 60 * 10).toISOString();
      from = new Date(String(from)).toISOString();
    }

    to = new Date(String(to)).toISOString();
    from = new Date(String(from)).toISOString();

    if (Math.abs(new Date(String(to)).getTime() - new Date(String(from)).getTime()) > 1000 * 60 * 60 * 24 * 30) {
      ctx.throw(422, "Time range too long");
    }

    if (level) {
      // @ts-ignore
      level = logLevels.labels[Number(level)];
    }

    ctx.body = {
      data: db.all(sql`
        select *
        from "main"."logs"
        where
          $${sqlUtils.btw(sql`"timestamp"`, from, to)}
          $${name ? sql` and $${sqlUtils.eq(sql`"name"`, name)}` : sql``}
          $${level ? sql` and $${sqlUtils.eq(sql`"level"`, level)}` : sql``}
          $${message ? sql` and $${sqlUtils.lk(sql`lower("message")`, `%${message}%`)}` : sql``}
        order by "timestamp" desc, "rowId" desc
      `),
    };
  });

  koa.use(cors());
  koa.use(basicAuth({ name: username, pass: password }));
  koa.use(router.routes());
  koa.use(router.allowedMethods());

  return koa;
};
