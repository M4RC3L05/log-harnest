import { BaseError } from "./base-error.js";

export class TimeRangeToBigError extends BaseError {
  constructor(message: string, cause?: unknown) {
    super("time-range-to-big-error", message, cause);
  }
}
