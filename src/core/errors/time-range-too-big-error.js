import { BaseError } from "./base-error.js";

export class TimeRangeToBigError extends BaseError {
  constructor(message, cause) {
    super("time-range-to-big-error", message, cause);
  }
}
