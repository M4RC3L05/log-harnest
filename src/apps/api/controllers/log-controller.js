// eslint-disable-next-line unused-imports/no-unused-imports, no-unused-vars
import Router from "@koa/router";

import * as handlers from "#src/methods/mod.js";

// eslint-disable-next-line import/no-anonymous-default-export
export default (router) => {
  router.get("/logs", (ctx) => {
    ctx.body = { data: handlers.log.getLogs({ ...ctx.request.query }) };
  });

  router.get("/logs/names", (ctx) => {
    ctx.body = { data: handlers.log.getLogNames() };
  });
};
