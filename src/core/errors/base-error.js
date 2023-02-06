export class BaseError extends Error {
  code;

  constructor(code, message, cause) {
    super(message, { cause });

    this.code = code;
  }
}
