import type { Tip } from "../type/blockfrost.type.ts";

/**
 * Using blockfrost api the get the tip of the chain
 */
export async function get_tip_api(
  blockfrost_base_url: string,
  blockfrost_api_key: string,
): Promise<Tip> {
  const res = await fetch(`${blockfrost_base_url}/blocks/latest`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      project_id: blockfrost_api_key,
    },
  });

  return await res.json();
}

/*
 * Call blockfrost endpoint and returns only the slot number
 */
export async function get_slot_api(
  blockfrost_base_url: string,
  blockfrost_api_key: string,
): Promise<number> {
  const tip = await get_tip_api(blockfrost_base_url, blockfrost_api_key);
  return tip.slot;
}
