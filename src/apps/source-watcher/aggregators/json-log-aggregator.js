import { setTimeout } from "node:timers/promises";

import * as abortControllerUtils from "#src/utils/abort-controller.js";
import * as logResolvers from "#src/core/resolvers/log-resolvers.js";
import { LogAggregator } from "./log-aggregator.js";
import { UnparsableLogError } from "#src/core/errors/mod.js";
import { logger } from "#src/core/logger/logger.js";

const log = logger("json-log-aggregator");

const parseLog = ({ name, maps, raw, timestamp }) => {
  try {
    const parsed = JSON.parse(raw);

    return {
      name: logResolvers.resolveName(parsed, maps, name),
      level: logResolvers.resolveLevel(parsed, maps, "info"),
      timestamp: logResolvers.resolveTimestamp(parsed, maps, timestamp),
      message: logResolvers.resolveMessage(parsed, maps, parsed?.message ?? parsed?.msg ?? ""),
      data: raw,
    };
  } catch (error) {
    throw new UnparsableLogError(log, error);
  }
};

const makeLog = (name, raw, maps = {}) => ({
  name,
  maps,
  raw: raw.trim(),
  timestamp: new Date().toISOString(),
});

export class JsonLogAggregator extends LogAggregator {
  #buffer;
  #timeoutFlushAbortController;
  #aggregatorAbortController;

  constructor(source, destination) {
    super(source, destination);

    this.#buffer = [];
    this.#timeoutFlushAbortController = new AbortController();
    this.#aggregatorAbortController = new AbortController();

    this.source.onData(this.#onData.bind(this));
    this.source.onError((error) => log.error(error, `Error on file source for "${this.source.name}"`));
    this.source.onClose((code, signal) =>
      log.info({ code, signal }, `Tail spawn process closed for "${this.source.name}"`),
    );
  }

  #timeoutFlush() {
    if (this.#timeoutFlushAbortController) {
      this.#timeoutFlushAbortController.abort();
    }

    this.#timeoutFlushAbortController = new AbortController();

    setTimeout(1000, undefined, {
      signal: abortControllerUtils.any(this.#timeoutFlushAbortController.signal, this.#aggregatorAbortController.signal)
        .signal,
    })
      .then(() => {
        log.debug("Flushing after timeout");

        return this.flush().catch((error) => log.error(error, "Unable to flush logs"));
      })
      .catch(() => {});
  }

  #onData(raw) {
    log.debug({ raw: raw.toString("utf8") }, "New log data");

    this.#timeoutFlush();

    if (this.#buffer.length >= 50) {
      log.debug({ length: this.#buffer.length }, "Force flush as buffer is too big");

      this.flush().catch((error) => log.error(error, "Unable to flush logs"));
      return;
    }

    this.#buffer.push(
      ...raw
        .toString("utf8")
        .split("\n")
        .map((rawLine) => rawLine.toString("utf8").trim())
        .filter((rawLine) => rawLine.length > 0)
        .map((rawLine) => makeLog(this.source.name, rawLine, this.source.maps)),
    );
  }

  async flush() {
    await this.destination.write(this.#buffer.map((log) => parseLog(log)));
    this.#buffer.length = 0;
  }

  async close() {
    await this.source.close();

    this.#aggregatorAbortController.abort();
    this.flush();
  }
}
