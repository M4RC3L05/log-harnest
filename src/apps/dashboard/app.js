import config from "config";
import Koa from "koa";
import basicAuth from "koa-basic-auth";
import koaStatic from "koa-static";

const { username, password } = config.get("apps.dashboard.basicAuth");

export const app = () => {
  const koa = new Koa();

  koa.use(basicAuth({ name: username, pass: password }));
  koa.use(koaStatic("./src/apps/dashboard/public"));
  koa.use(koaStatic("./node_modules"));

  return koa;
};
