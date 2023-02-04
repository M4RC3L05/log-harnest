// eslint-disable-next-line unused-imports/no-unused-imports, no-unused-vars
import Router from "@koa/router";

import logController from "#src/apps/api/controllers/log-controller.js";

/**
 * @param {Router} router
 */
// eslint-disable-next-line import/no-anonymous-default-export
export default (router) => {
  logController(router);
};
