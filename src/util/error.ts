/**
 * A custom error class for handling API-related errors with additional metadata.
 */
export class ApiError extends Error {
  code: number;
  extra: object;
  devMessage: string;
  id: string;

  /**
   * Creates a new ApiError instance with the provided details.
   *
   * @param {string | undefined} message - The error message to display.
   * @param {string | undefined} name - The name or category of the error (e.g., "NETWORK_ERROR").
   * @param {number | undefined} code - The HTTP status code associated with the error.
   * @param {object | undefined} extra - Additional contextual information related to the error.
   * @param {string | undefined} id - Request id.
   * @param {string | undefined} devMessage - A developer-oriented message containing more details about the error.
   */
  constructor(
    message: string | undefined,
    name: string | undefined,
    code: number | undefined = undefined,
    extra: object | undefined = undefined,
    id: string | undefined = undefined,
    devMessage: string | undefined = undefined,
  ) {
    super(message);

    this.name = name || "UNKNOWN_ERROR";
    this.cause = name || "UNKNOWN_ERROR";
    this.code = code || 500;
    this.extra = extra || {};
    this.id = id || "";
    this.devMessage = devMessage || "";
  }
}
