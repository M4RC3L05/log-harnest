import Koa from "koa";
import Router from "@koa/router";
import basicAuth from "koa-basic-auth";
import config from "config";
import cors from "@koa/cors";

import controller from "#src/apps/api/controllers/mod.js";
import { errorMapperMiddleware } from "#src/core/middlewares/error-mapper.js";

const { username, password } = config.get<{ username: string; password: string }>("apps.api.basicAuth");

export const app = () => {
  const koa = new Koa();
  const router = new Router({ prefix: "/api" });

  controller(router);

  koa.use(errorMapperMiddleware);
  koa.use(cors());
  koa.use(basicAuth({ name: username, pass: password }));
  koa.use(router.routes());
  koa.use(router.allowedMethods());

  return koa;
};
