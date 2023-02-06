import { BaseError } from "./base-error.js";

export class UnparsableLogError extends BaseError {
  constructor(log, cause) {
    super("unparsable-log-error", "Could not parse log line", cause);

    this.log = log;
  }
}
