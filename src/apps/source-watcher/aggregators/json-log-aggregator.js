import { setTimeout } from "node:timers/promises";

import * as abortControllerUtils from "#src/utils/abort-controller.js";
import { LogAggregator } from "./log-aggregator.js";
import { logger } from "#src/core/logger/logger.js";

const log = logger("json-log-aggregator");

const isJSON = (data) => {
  try {
    return typeof JSON.parse(data) === "object";
  } catch {
    return false;
  }
};

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
        .filter((rawLine) => rawLine.length > 0 && isJSON(rawLine))
        .map((rawLine) => this.destination.makeLog(this.source.name, JSON.parse(rawLine), this.source.maps)),
    );
  }

  async flush() {
    await this.destination.write(this.#buffer);

    this.#buffer.length = 0;
  }

  async close() {
    await this.source.close();

    this.#aggregatorAbortController.abort();
    this.flush();
  }
}
