import { pino } from "pino";

/**
 * @param { string } name
 */
export const logger = (name) => pino({ name, level: "info" });
