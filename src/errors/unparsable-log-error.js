export class UnparsableLogError extends Error {
  constructor(log, cause) {
    super("Could not parse log line", { cause });

    this.log = log;
  }
}
