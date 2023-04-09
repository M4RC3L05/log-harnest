/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-await-in-loop */
import config from "config";

import { type LogAggregator } from "#src/apps/source-watcher/aggregators/mod.js";
import { type SourceConfig } from "#src/apps/source-watcher/aggregators/sources/mod.js";
import { logger } from "#src/core/logger/logger.js";

const log = logger("source-watcher");

const aggregators = await import(`#src/apps/source-watcher/aggregators/mod.js`);
const aggregatorSources = await import(`#src/apps/source-watcher/aggregators/sources/mod.js`);
const aggregatorDestinations = await import(`#src/apps/source-watcher/aggregators/destinations/mod.js`);

export const app = () => {
  const sources =
    config.get<Record<string, SourceConfig & { config: { aggregator: string; source: string; destination: string } }>>(
      "sources",
    );

  log.info({ sources }, "Watching given sources");

  const aggregatorInstances: LogAggregator[] = [];

  for (const source of Object.values(sources)) {
    aggregatorInstances.push(
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      new aggregators[source.config.aggregator](
        // @ts-expect-error
        new aggregatorSources[source.config.source](source),
        // @ts-expect-error
        new aggregatorDestinations[source.config.destination](source),
      ),
    );
  }

  const close = async () => {
    for (const aggregator of aggregatorInstances) await aggregator.close();
  };

  return { close };
};
