import childProcess from "node:child_process";

import { LogAggregatorSource, type SourceConfig } from "./log-aggregator-source.js";

export class TailLogAggregatorSource extends LogAggregatorSource {
  #tail;

  constructor(source: SourceConfig) {
    super(source);

    this.#tail = childProcess.spawn("tail", ["-f", source.source, "-n", "0"]);
  }

  onData(fn: (data: string) => void) {
    this.#tail.stdout.addListener("data", (data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      fn(data.toString("utf8"));
    });
  }

  onClose(fn: () => void) {
    this.#tail.addListener("close", fn);
  }

  onError(fn: (error: Error) => void) {
    this.#tail.addListener("error", fn);
  }

  async close() {
    this.#tail.kill();
  }
}
