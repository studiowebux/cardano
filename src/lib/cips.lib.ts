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

export function format_cip25(
  metadata: CIP25Metadata,
  asset_name: string,
  policy_id: string,
): CIP25Formatted {
  const formatted_metadata: CIP25Formatted = { "721": [] };

  formatted_metadata["721"] = [
    {
      [policy_id]: {
        [asset_name]: {
          ...metadata,
        },
      },
    },
  ];
  return formatted_metadata;
}
