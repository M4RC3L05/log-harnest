export class BaseError extends Error {
  code!: string;

  constructor(code: string, message: string, cause: unknown) {
    super(message, { cause });

    this.code = code;
  }
}
