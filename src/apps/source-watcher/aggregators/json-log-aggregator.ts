import { setTimeout } from "node:timers/promises";

import * as abortControllerUtils from "#src/utils/abort-controller.js";
import {
  type Log,
  type LogAggregatorDestination,
} from "#src/apps/source-watcher/aggregators/destinations/log-aggregator-destination.js";
import { LogAggregator } from "./log-aggregator.js";
import { type LogAggregatorSource } from "#src/apps/source-watcher/aggregators/sources/log-aggregator-source.js";
import { logger } from "#src/core/logger/logger.js";

const log = logger("json-log-aggregator");

const isJson = (data: any) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return typeof JSON.parse(data) === "object";
  } catch {
    return false;
  }
};

export class JsonLogAggregator extends LogAggregator {
  #buffer: Log[];
  #timeoutFlushAbortController;
  #aggregatorAbortController;

  constructor(source: LogAggregatorSource, destination: LogAggregatorDestination) {
    super(source, destination);

    this.#buffer = [];
    this.#timeoutFlushAbortController = new AbortController();
    this.#aggregatorAbortController = new AbortController();

    this.source.onData(this.#onData.bind(this));
    this.source.onError((error) => {
      log.error(error, `Error for "${this.source.name}"`);
    });
    this.source.onClose((...args) => {
      log.info({ args }, `Close for "${this.source.name}"`);
    });
  }

  async flush() {
    await this.destination.write(this.#buffer);

    this.#buffer.length = 0;
  }

  async close() {
    await this.source.close();
    await this.destination.close();

    this.#aggregatorAbortController.abort();
    await this.flush();
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
      .then(async () => {
        log.debug("Flushing after timeout");

        return this.flush().catch((error) => {
          log.error(error, "Unable to flush logs");
        });
      })
      .catch(() => {
        // Ignone abort controller error
      });
  }

  #onData(raw: string) {
    log.debug({ raw }, "New log data");

    this.#timeoutFlush();

    if (this.#buffer.length >= 50) {
      log.debug({ length: this.#buffer.length }, "Force flush as buffer is too big");

      this.flush().catch((error) => {
        log.error(error, "Unable to flush logs");
      });
      return;
    }

    this.#buffer.push(
      ...raw
        .split("\n")
        .map((rawLine) => rawLine.trim())
        .filter((rawLine) => rawLine.length > 0 && isJson(rawLine))
        .map((rawLine) =>
          this.destination.makeLog(this.source.name, JSON.parse(rawLine) as Record<string, unknown>, this.source.maps),
        ),
    );
  }
}
