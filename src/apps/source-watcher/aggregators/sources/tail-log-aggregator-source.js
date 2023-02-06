import childProcess from "node:child_process";

import { LogAggregatorSource } from "./log-aggregator-source.js";

export class TailLogAggregatorSource extends LogAggregatorSource {
  #tail;

  constructor(source) {
    super(source);

    this.#tail = childProcess.spawn("tail", ["-f", this.source, "-n", "0"]);
  }

  onData(fn) {
    this.#tail.stdout.addListener("data", fn);
  }

  onClose(fn) {
    this.#tail.addListener("close", fn);
  }

  onError(fn) {
    this.#tail.addListener("error", fn);
  }

  async close() {
    this.#tail.kill();
  }
}
