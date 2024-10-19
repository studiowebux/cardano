import { Buffer } from "node:buffer";

/**
 * Converts a given string to a byte buffer.
 *
 * @param {string} input - The input string to convert.
 * @returns {Buffer} A Buffer object containing the bytes representation of the input string.
 */
export function string_to_bytes(input: string): Buffer {
  return Buffer.from(input);
}

/**
 * Converts a given hexadecimal string to a byte buffer.
 *
 * @param {string} input - The hexadecimal string to convert (e.g., "616263").
 * @returns {Buffer} A Buffer object containing the bytes representation of the input hexadecimal string.
 */
export function hex_to_bytes(input: string): Buffer {
  return Buffer.from(input, "hex");
}

/**
 * Converts a given hexadecimal string to a uint8 array.
 *
 * @param {string} input - The hexadecimal string to convert (e.g., "616263").
 * @returns {Uint8Array} A Uint8Array representation of the input hexadecimal string.
 */
export function hex_to_uint8(input: string): Uint8Array {
  return new Uint8Array(Buffer.from(input, "hex"));
}

/**
 * Converts a given string to a Uint8Array.
 *
 * @param {string} input - The input string to convert.
 * @returns {Uint8Array} A Uint8Array representation of the input string.
 */
export function string_to_uint8(input: string): Uint8Array {
  return new Uint8Array(Buffer.from(input));
}

/**
 * Converts a given Uint8Array to a string.
 *
 * @param {Uint8Array} input - The input Uint8Array to convert.
 * @returns {string} A string representation of the input Uint8Array.
 */
export function uint8_to_string(input: Uint8Array): string {
  return new TextDecoder("utf-8").decode(input);
}

/**
 * Converts a given byte array to a hexadecimal string.
 *
 * @param {Uint8Array} input - The byte array to convert (e.g., Uint8Array([0x61, 0x62, 0x63])).
 * @returns {string} A hexadecimal string representation of the input byte array (e.g., "616263").
 */
export function bytes_to_hex(input: Uint8Array): string {
  return Buffer.from(input).toString("hex");
}

/**
 * Converts a given string to a hexadecimal string.
 *
 * @param {string} input - The string to convert.
 * @returns {string} A hexadecimal string representation of the input byte array (e.g., "616263").
 */
export function string_to_hex(input: string): string {
  return Buffer.from(input).toString("hex");
}
