/**
 * @module
 *
 * This module contains functions for converting Cardano assets into a Value object.
 */

import {
  type MultiAsset,
  Value,
  Assets,
  AssetName,
  BigNum,
  ScriptHash,
} from "@emurgo/cardano-serialization-lib-nodejs";

import { ApiError } from "../util/error.ts";
import type { Asset } from "../type/blockfrost.type.ts";
import { encode_to_hex, hex_to_bytes } from "../util/encode.ts";

/**
 * Converts a MultiAsset instance along with an array of assets into a Value object.
 *
 * @param {MultiAsset} multi_asset - The MultiAsset instance to modify and return.
 * @param {Asset[]} assets - An array of assets to be included in the MultiAsset.
 * @returns {Value} The resulting Value object after adding the provided assets to it.
 * @throws {ApiError} If no lovelace asset is found among the provided assets.
 */
export function assets_to_value(
  multi_asset: MultiAsset,
  assets: Asset[],
): Value {
  const qt = assets.find((asset) => asset.unit === "lovelace")?.quantity;
  if (!qt) {
    throw new ApiError(
      "No lovelace found in the provided utxo",
      "NO_LOVELACE",
      404,
    );
  }
  assets.forEach((asset) => {
    if (asset.unit !== "lovelace") {
      const policy_hex = hex_to_bytes(asset.unit.slice(0, 56));
      const asset_hex = hex_to_bytes(asset.unit.slice(56));

      const asset_to_add = Assets.new();
      asset_to_add.insert(
        AssetName.new(asset_hex),
        BigNum.from_str(asset.quantity),
      );

      multi_asset.insert(ScriptHash.from_bytes(policy_hex), asset_to_add);
    }
  });

  const v = Value.new_from_assets(multi_asset);
  v.set_coin(BigNum.from_str(qt));
  return v;
}

export function get_asset_name_v2(asset_name: string): string {
  return AssetName.new(encode_to_hex(asset_name)).to_hex();
}
