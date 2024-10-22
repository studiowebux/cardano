import type { Sql } from "postgresjs";
import type { Utxo } from "../type/blockfrost.type.ts";
import { ApiError } from "../util/error.ts";

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

/**
 * Inspired from blockfrost SQL
 * Changed a little bit to fit only what I need for my project.
 * You should use Blockfrost if you do not want to spin a DB Sync Cluster.
 */
export async function get_utxos_dbsync(
  sql: Sql,
  address: string,
  limit: number = 100,
  offset: number = 0,
): Promise<Utxo[]> {
  // https://github.com/blockfrost/blockfrost-backend-ryo/blob/c6d26afa1a5cc22cb3c253ccfd01c41f46d5dcb9/src/sql/addresses/addresses_address_utxos.sql
  const utxos: Array<Utxo & { lovelace: string }> = await sql`
    SELECT txo.address AS "address",
    encode(tx.hash, 'hex') AS "tx_hash",
    txo.index AS "output_index",
    txo.value::TEXT as "lovelace",
    (
      SELECT json_agg(
          json_build_object(
            'unit',
            CONCAT(encode(ma.policy, 'hex'), encode(ma.name, 'hex')),
            'quantity',
            mto.quantity::TEXT
          )
        )
      FROM ma_tx_out mto
        JOIN multi_asset ma ON (mto.ident = ma.id)
      WHERE mto.tx_out_id = txo.id
    ) AS "amount",
    encode(b.hash, 'hex') AS "block",
    encode(data_hash, 'hex') AS "data_hash",
    encode(dat.bytes, 'hex') AS "inline_datum",
    encode(scr.hash, 'hex') AS "reference_script_hash"
  FROM tx
    JOIN tx_out txo ON (tx.id = txo.tx_id)
    LEFT JOIN tx_in txi ON (txo.tx_id = txi.tx_out_id)
    AND (txo.index = txi.tx_out_index)
    JOIN block b ON (b.id = tx.block_id)
    LEFT JOIN datum dat ON (txo.inline_datum_id = dat.id)
    LEFT JOIN script scr ON (txo.reference_script_id = scr.id)
  WHERE txi.tx_in_id IS NULL
    AND txo.address = ${address}
  ORDER BY txo.id
  LIMIT ${limit} OFFSET ${offset}`;

  if (!utxos || utxos.length === 0) {
    throw new ApiError(
      `No valid UTXO available for address: ${address}`,
      "UTXO_NOT_FOUND",
      404,
    );
  }

  // Bring back same format as blockfrost.
  // this is only my fallback for testing purposes.
  return utxos.map((utxo) => {
    const amount = [{ unit: "lovelace", quantity: utxo.lovelace }];
    return {
      address: utxo.address,
      tx_hash: utxo.tx_hash,
      output_index: utxo.output_index,
      block: utxo.block,
      data_hash: utxo.data_hash,
      inline_datum: utxo.inline_datum,
      reference_script_hash: utxo.reference_script_hash,
      amount: utxo.amount ? [...amount, ...utxo.amount] : amount,
    };
  });
}
