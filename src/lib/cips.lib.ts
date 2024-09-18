import { AssetName } from "@emurgo/cardano-serialization-lib-nodejs";
import { Buffer } from "node:buffer";
//
// CIP27

//
export type CIP27Formatted = {
  "777": {
    addr: string;
    rate: string;
  };
};

export function format_cip27(rate: string, addr: string): CIP27Formatted {
  return { "777": { rate, addr } };
}

//
// CIP25
//
export type CIP25Metadata = Record<string, unknown>;

export type CIP25Formatted = {
  "721": {
    [policyId: string]: {
      [assetName: string]: CIP25Metadata;
    };
  }[];
};

/**
 * Format metadata for CIP-25 Version 2
 */
export function format_cip25(
  metadata: CIP25Metadata,
  asset_name: string,
  policy_id: string,
): CIP25Formatted {
  const asset_name_encoded = AssetName.new(Buffer.from(asset_name)).to_hex();
  const formatted_metadata: CIP25Formatted = { "721": [] };

  formatted_metadata["721"] = [
    {
      [policy_id]: {
        [asset_name_encoded]: {
          ...metadata,
        },
      },
    },
  ];
  return formatted_metadata;
}
