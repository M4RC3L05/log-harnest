import cp from "node:child_process";
import { setTimeout } from "node:timers/promises";

import sql from "@leafac/sqlite";
import config from "config";

import { db } from "#src/database/db.js";
import { logger } from "#src/logger/logger.js";
import * as logResolvers from "#src/resolvers/log-resolvers.js";
import * as abortControllerUtils from "#src/utils/abort-controller.js";
import * as sqlUtils from "#src/utils/sql.js";

const log = logger("source-watcher");

class UnparsableLogLineError extends Error {
  /**
   * @param { LogRecord } logRecord
   * @param { unknown } cause
   */
  constructor(logRecord, cause) {
    super("Could not parse log line", { cause });

    this.logRecord = logRecord;
  }
}

/**
 * @typedef { object } LogSource
 * @property { string } name
 * @property { Record<string, string> } [maps]
 * @property { string } source
 */

/**
 * @typedef { object } LogRecord
 * @property { LogSource } source
 * @property { string } logLine
 * @property { string } timestamp
 * @property { any } [logLineParsed]
 */

/**
 * @typedef { object } Buffer
 * @property { () => LogRecord[] } get
 * @property { (...value: LogRecord[]) => void } add
 * @property { () => number } count
 * @property { () => void } empty
 */

/**
 * @param { Pick<Buffer, "get" | "count" | "empty"> } bufferInterface
 */
const flusher = (bufferInterface) => {
  return () => {
    if (bufferInterface.count() <= 0) return;

    const logValues = bufferInterface
      .get()
      .filter((bufferLine) => {
        try {
          const parsed = JSON.parse(bufferLine.logLine);
          bufferLine.logLineParsed = parsed;

          return true;
        } catch (error) {
          log.error(new UnparsableLogLineError(bufferLine, error), "Could not parse line");

          return false;
        }
      })
      .map((bufferLine) => {
        const maps = bufferLine.source.maps ?? {};

        const logRow = {
          name: logResolvers.resolveName(bufferLine.logLineParsed, maps, bufferLine.source.name),
          level: logResolvers.resolveLevel(bufferLine.logLineParsed, maps, "info"),
          timestamp: logResolvers.resolveTimestamp(bufferLine.logLineParsed, maps, bufferLine.timestamp),
          message: logResolvers.resolveMessage(
            bufferLine.logLineParsed,
            maps,
            bufferLine.logLineParsed?.message ?? bufferLine.logLineParsed?.msg ?? "",
          ),
          data: bufferLine.logLine,
        };

        return sql`(${logRow.name}, ${logRow.level}, ${logRow.message}, ${logRow.timestamp}, ${logRow.data})`;
      });

    db.run(sql`
      insert into "logs"
      ("name", "level", "message", "timestamp", "data")
      values
      $${sqlUtils.join(logValues, sql`,`)}
    `);

    bufferInterface.empty();
  };
};

/**
 * @param { Pick<Buffer, "add" | "count"> } bufferInterface
 */
const aggregator = (bufferInterface) => {
  /**
   * @param { LogSource } source
   * @param { string } logLine
   */
  return (source, logLine) => {
    bufferInterface.add(
      ...logLine
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .map((l) => ({ source, logLine: l.trim(), timestamp: new Date().toISOString() })),
    );
  };
};

/**
 * @param {{ flush: () => void, signal: AbortSignal }} args
 */
const timeoutFlusher = ({ flush, signal }) => {
  let aggregateTimeoutAbortController = new AbortController();

  return () => {
    if (aggregateTimeoutAbortController) {
      aggregateTimeoutAbortController.abort();
    }

    aggregateTimeoutAbortController = new AbortController();

    setTimeout(1000, undefined, {
      signal: abortControllerUtils.any(aggregateTimeoutAbortController.signal, signal).signal,
    })
      .then(() => {
        log.debug("Flushing after timeout");

        flush();
      })
      .catch(() => {});
  };
};

export const app = () => {
  const /** @type { Record<string, LogSource> } */ sources = config.get("sources");

  log.info({ sources }, "Watching given sources");

  const tails = Object.values(sources).map((r) => {
    return {
      source: r,
      tail: cp.spawn("tail", ["-f", r.source, "-n", "0"]),
    };
  });
  const tailAgregators = tails.map(({ tail, source }) => {
    const aggregateAbortController = new AbortController();

    const /** @type { LogRecord[] } */ buffer = [];
    const flush = flusher({
      get: () => buffer,
      empty() {
        buffer.length = 0;
      },
      count: () => buffer.length,
    });
    const aggregate = aggregator({ add: (...values) => buffer.push(...values), count: () => buffer.length });
    const timeoutFlush = timeoutFlusher({ flush, signal: aggregateAbortController.signal });

    const onTailData = (/** @type {any} */ raw) => {
      timeoutFlush();

      // Force flush buffer if big
      if (buffer.length >= 50) flush();

      aggregate(source, raw.toString("utf8"));
    };

    tail.stdout.on("data", onTailData);
    tail
      .on("error", (error) => log.error(error, `Error on tail spawn process for "${source.name}"`))
      .on("close", (code, signal) => log.info({ code, signal }, `Tail spawn process closed for "${source.name}"`));

    return {
      tail,
      source,
      aggregateAbortController: () => aggregateAbortController,
      flush,
    };
  });

  const close = () => {
    for (const { tail } of tails) tail.kill();

    for (const { aggregateAbortController, flush } of tailAgregators) {
      aggregateAbortController().abort();
      flush();
    }
  };

  return { close };
};
