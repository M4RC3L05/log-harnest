import Koa from "koa";
import basicAuth from "koa-basic-auth";
import koaStatic from "koa-static";

export const app = () => {
  const koa = new Koa();

  koa.use(basicAuth({ name: "foo", pass: "bar" }));
  koa.use(koaStatic("./src/apps/dashboard/public"));
  koa.use(koaStatic("./node_modules"));

  return koa;
};
