import Koa from "koa";
import basicAuth from "koa-basic-auth";
import config from "config";
import koaStatic from "koa-static";

const { username, password } = config.get<{ username: string; password: string }>("apps.dashboard.basicAuth");

export const app = () => {
  const koa = new Koa();

  koa.use(basicAuth({ name: username, pass: password }));
  koa.use(koaStatic("./src/apps/dashboard/public"));
  koa.use(koaStatic("./node_modules"));

  return koa;
};
