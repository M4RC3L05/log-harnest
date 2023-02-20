import * as handlers from "#src/methods/mod.js";
import { type GetLogsArgs } from "#src/methods/log/get-logs.js";

import type Router from "@koa/router";

// eslint-disable-next-line import/no-anonymous-default-export
export default (router: Router) => {
  router.get("/logs", (ctx) => {
    ctx.body = { data: handlers.log.getLogs({ ...ctx.request.query } as GetLogsArgs) };
  });

  router.get("/logs/names", (ctx) => {
    ctx.body = { data: handlers.log.getLogNames() };
  });
};
