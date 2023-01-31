import Koa from "koa";
import koaStatic from "koa-static";

export const app = () => {
  const koa = new Koa();

  koa.use(koaStatic("./src/apps/dashboard/public"));
  koa.use(koaStatic("./node_modules"));

  return koa;
};
