import cors from "@koa/cors";
import Router from "@koa/router";
import config from "config";
import Koa from "koa";
import basicAuth from "koa-basic-auth";

import controller from "#src/apps/api/controllers/mod.js";
import { errorMapperMiddleware } from "#src/middlewares/error-mapper.js";

const { username, password } = config.get("apps.api.basicAuth");

export const app = () => {
  const koa = new Koa();
  const router = new Router({ prefix: "/api" });

  controller(router);

  koa.use(cors());
  koa.use(basicAuth({ name: username, pass: password }));
  koa.use(errorMapperMiddleware);
  koa.use(router.routes());
  koa.use(router.allowedMethods());

  return koa;
};
