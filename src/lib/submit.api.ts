import { hex_to_bytes } from "../util/encode.ts";
import { ApiError } from "../util/error.ts";

/**
 * Submit Transaction to network using the cardano-submit-api
 * The transaction must be a cbor hex (84...)
 * Official API Definition: https://input-output-hk.github.io/cardano-rest/submit-api/#operation/postTransaction
 * @param transaction cborHex
 * @returns transaction hash on success or an object with the error details
 */
export async function submit_api(
  cardano_submit_api_base_url: string,
  transaction: string,
): Promise<string | object> {
  const res = await fetch(`${cardano_submit_api_base_url}/api/submit/tx`, {
    method: "POST",
    body: hex_to_bytes(transaction),
    headers: { "Content-Type": "application/cbor" },
  });
  const json_data = await res.json();
  if (res.status < 200 || res.status > 299) {
    throw new ApiError(
      JSON.stringify(json_data, null, 2),
      "ERROR_SUBMIT_TX",
      res.status,
    );
  }
  return json_data;
}

// TODO: Blockfrost submit_api
