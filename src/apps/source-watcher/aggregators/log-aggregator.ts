import { type LogAggregatorDestination } from "#src/apps/source-watcher/aggregators/destinations/mod.js";
import { type LogAggregatorSource } from "#src/apps/source-watcher/aggregators/sources/log-aggregator-source.js";

export class LogAggregator {
  constructor(protected source: LogAggregatorSource, protected destination: LogAggregatorDestination) {}

  async close() {
    //
  }
}
