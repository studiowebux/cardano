export class ApiError extends Error {
  cause: string;
  name: string;
  code: number;
  extra: object;
  devMessage: string;

  constructor(
    message: string | undefined,
    name: string | undefined,
    code: number | undefined = undefined,
    extra: object | undefined = undefined,
    devMessage: string | undefined = undefined,
  ) {
    super(message);

    this.name = name || "UNKNOWN_ERROR";
    this.cause = name || "UNKNOWN_ERROR";
    this.code = code || 500;
    this.extra = extra || {};
    this.devMessage = devMessage || "";
  }
}
