import { BaseError } from "./base-error.js";

export class MissingTimeRangeError extends BaseError {
  constructor(message, cause) {
    super("missing-time-range-error", message, cause);
  }
}
