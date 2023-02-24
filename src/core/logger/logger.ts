import path from "node:path";

import config from "config";
import { pino } from "pino";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const transport = pino.transport({
  target: path.resolve("./src/core/logger/transporter.js"),
  options: { name: "log-harnest" },
});

export const logger = (name: string) => pino({ name, level: config.get("logger.level") }, transport);
