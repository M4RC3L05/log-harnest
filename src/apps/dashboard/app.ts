import Koa from "koa";
import basicAuth from "koa-basic-auth";
import config from "config";
import koaStatic from "koa-static";
import proxy from "koa-proxies";

const { username, password } = config.get<{ username: string; password: string }>("apps.dashboard.basicAuth");

export const app = () => {
  const koa = new Koa();

  koa.use(basicAuth({ name: username, pass: password }));
  koa.use(koaStatic("./src/apps/dashboard/public"));
  koa.use(
    proxy(/^\/(stable|v\d+)/, {
      target: config.get("apps.dashboard.esmsh"),
      changeOrigin: true,
    }),
  );

  return koa;
};
