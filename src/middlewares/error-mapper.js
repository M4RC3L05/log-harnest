import { GetLogsMissingTimeRangeError, GetLogsTimeRangeToLargeError } from "#src/handlers/log/get-logs.js";
import { logger } from "#src/logger/logger.js";

const log = logger("error-mapper-middleware");

export const /** @type { import("koa").Middleware } */ errorMapperMiddleware = async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      log.error(typeof error === "object" ? error : { error }, "Error caugth");

      if (error instanceof GetLogsMissingTimeRangeError || error instanceof GetLogsTimeRangeToLargeError) {
        ctx.status = 422;
        ctx.body = { error: { message: error.message, code: error.code, status: 422 } };

        return;
      }

      ctx.status = 500;
      ctx.body = { error: { message: "Internal server error", status: 500, code: "internal-server-error" } };
    }
  };
