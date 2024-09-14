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
 * Converts a given byte array to a hexadecimal string.
 *
 * @param {Uint8Array} input - The byte array to convert (e.g., Uint8Array([0x61, 0x62, 0x63])).
 * @returns {string} A hexadecimal string representation of the input byte array (e.g., "616263").
 */
export function bytes_to_hex(input: Uint8Array): string {
  return Buffer.from(input).toString("hex");
}
