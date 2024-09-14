import type { Utxo } from "../type/blockfrost.type.ts";

/**
 * Get Address utxos from blockfrost
 */
export async function get_utxos_api(
  blockfrost_base_url: string,
  blockfrost_api_key: string,
  address: string,
): Promise<Utxo[]> {
  const get = async (data: object[] = [], page: number = 1) => {
    const res = await fetch(
      `${blockfrost_base_url}/addresses/${address}/utxos?page=${page}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          project_id: blockfrost_api_key,
        },
      },
    );

    if (res.status < 199 || res.status > 200) {
      throw new Error("Unable to get utxos for specified address");
    }

    const json = await res.json();
    if (json.length > 0) {
      return await get([...data, ...json], (page += 1));
    }

    return [...data, ...json];
  };

  return await get();
}

/**
 * Using blockfrost returns all utxos for an address, policy id and asset name.
 */
export async function get_utxos_for_asset_api(
  blockfrost_base_url: string,
  blockfrost_api_key: string,
  address: string,
  policy_id: string,
  asset_name: string,
): Promise<Utxo[]> {
  const get = async (data: object[] = [], page: number = 1) => {
    const res = await fetch(
      `${blockfrost_base_url}/addresses/${address}/utxos/${policy_id}${asset_name}?page=${page}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          project_id: blockfrost_api_key,
        },
      },
    );

    if (res.status < 199 || res.status > 200) {
      throw new Error("Unable to get utxos for specified address");
    }

    const json = await res.json();
    if (json.length > 0) {
      return await get([...data, ...json], (page += 1));
    }

    return [...data, ...json];
  };

  return await get();
}
