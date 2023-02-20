import { type Context, type Next } from "koa";

import { type BaseError, MissingTimeRangeError, TimeRangeToBigError } from "#src/core/errors/mod.js";
import { logger } from "#src/core/logger/logger.js";

const log = logger("error-mapper-middleware");

export const errorMapperMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error: unknown) {
    log.error(typeof error === "object" ? error : { error }, "Error caugth");

    if (error instanceof MissingTimeRangeError || error instanceof TimeRangeToBigError) {
      ctx.status = 422;
      ctx.body = {
        error: { message: (error as BaseError).message, code: (error as BaseError).code, status: 422 },
      };

      return;
    }

    if (error instanceof Error && error?.name === "UnauthorizedError") {
      for (const [key, value] of Object.entries((error as any)?.headers ?? {})) ctx.set(key, value as any);

      ctx.status = (error as any).status as number;
      ctx.body = {
        error: {
          message: error.message,
          code: error.name.toLowerCase(),
          status: (error as any).status as number,
        },
      };

      return;
    }

    ctx.status = 500;
    ctx.body = { error: { message: "Internal server error", status: 500, code: "internal-server-error" } };
  }
};
