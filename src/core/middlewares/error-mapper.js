import { MissingTimeRangeError, TimeRangeToBigError } from "#src/core/errors/mod.js";
import { logger } from "#src/core/logger/logger.js";

const log = logger("error-mapper-middleware");

export const errorMapperMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    log.error(typeof error === "object" ? error : { error }, "Error caugth");

    if (error instanceof MissingTimeRangeError || error instanceof TimeRangeToBigError) {
      ctx.status = 422;
      ctx.body = { error: { message: error.message, code: error.code, status: 422 } };

      return;
    }

    if (error instanceof Error && error?.name === "UnauthorizedError") {
      for (const [key, value] of Object.entries(error.headers)) ctx.set(key, value);

      ctx.status = error.status;
      ctx.body = { error: { message: error.message, code: error.name.toLowerCase(), status: error.status } };

      return;
    }

    ctx.status = 500;
    ctx.body = { error: { message: "Internal server error", status: 500, code: "internal-server-error" } };
  }
};
