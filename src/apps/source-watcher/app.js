import config from "config";

import {
  JsonLogAggregator,
  destinations as aggregatorDestinations,
  sources as aggregatorsSources,
} from "#src/apps/source-watcher/aggregators/mod.js";
import { logger } from "#src/logger/logger.js";

const log = logger("source-watcher");

export const app = () => {
  const sources = config.get("sources");

  log.info({ sources }, "Watching given sources");

  const aggregators = Object.values(sources).map(
    (source) =>
      new JsonLogAggregator(
        new aggregatorsSources.TailLogAggregatorSource(source),
        new aggregatorDestinations.DatabaseLogAggregatorDestination(),
      ),
  );

  const close = async () => {
    // eslint-disable-next-line no-await-in-loop
    for (const aggregator of aggregators) await aggregator.close();
  };

  return { close };
};
