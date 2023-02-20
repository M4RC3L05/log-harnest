import config from "config";
import { pino } from "pino";

export const logger = (name: string) => pino({ name, level: config.get("logger.level") });
