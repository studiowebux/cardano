import { Buffer } from "node:buffer";

export function encode_to_hex(input: string): Buffer {
  return Buffer.from(input);
}

export function hex_to_bytes(input: string): Buffer {
  return Buffer.from(input, "hex");
}

export function bytes_to_hex(input: Uint8Array): string {
  return Buffer.from(input).toString("hex");
}
