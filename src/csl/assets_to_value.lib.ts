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
import { hex_to_uint8, string_to_uint8 } from "../util/encode.ts";

/**
 * Converts a given MultiAsset instance and an array of assets into a Value object.
 *
 * This function iterates through the provided `assets` array to find lovelace,
 * then inserts all other assets (excluding lovelace) into the MultiAsset. It
 * finally creates and returns a new Value object with both multi-asset and lovelace quantities.
 *
 * @param {MultiAsset} multi_asset - The initial MultiAsset instance to modify and return.
 * @param {Asset[]} assets - An array of assets containing the units and quantities to include in the MultiAsset.
 * @returns {Value} The resulting Value object after adding the provided assets (excluding lovelace) to it
 *                   and setting the lovelace quantity.
 * @throws {ApiError} If no lovelace asset is found among the provided assets,
 *                    indicating an error with a status code of 404.
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

  const assets_to_add: Record<string, Assets> = {};

  assets.forEach((asset) => {
    if (asset.unit !== "lovelace") {
      const policy_hex = asset.unit.slice(0, 56);
      const asset_hex = hex_to_uint8(asset.unit.slice(56));

      if (!assets_to_add[policy_hex]) {
        assets_to_add[policy_hex] = Assets.new();
      }

      assets_to_add[policy_hex].insert(
        AssetName.new(asset_hex),
        BigNum.from_str(asset.quantity),
      );
    }
  });

  for (const key of Object.keys(assets_to_add)) {
    multi_asset.insert(ScriptHash.from_hex(key), assets_to_add[key]);
  }

  return Value.new_with_assets(BigNum.from_str(qt), multi_asset);
}

/**
 * Encodes an asset name string into hex bytes using the Cardano encoding format.
 *
 * This function takes an asset name as a string, encodes it into bytes,
 * converts those bytes to hexadecimal, and returns the resulting hex string.
 *
 * @param {string} asset_name - The asset name string to encode.
 * @returns {string} The encoded asset name as a hexadecimal string.
 */
export function get_asset_name_v2(asset_name: string): string {
  return AssetName.new(string_to_uint8(asset_name)).to_hex();
}
