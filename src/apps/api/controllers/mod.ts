import logController from "#src/apps/api/controllers/log-controller.js";

import type Router from "@koa/router";

// eslint-disable-next-line import/no-anonymous-default-export
export default (router: Router) => {
  logController(router);
};
