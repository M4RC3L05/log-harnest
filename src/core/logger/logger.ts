import path from "node:path";

import config from "config";
import { pino } from "pino";

export const logger = (name: string) =>
  pino({
    transport: {
      targets: [
        {
          target: path.resolve("./src/core/logger/transporter.js"),
          level: config.get("logger.level"),
          options: { name: `log-harnest`, component: name },
        },
      ],
    },
    level: config.get("logger.level"),
  });
