import { BaseError } from "./base-error.js";

export class MissingTimeRangeError extends BaseError {
  constructor(message: string, cause?: unknown) {
    super("missing-time-range-error", message, cause);
  }
}
