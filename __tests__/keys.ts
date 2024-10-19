import {
  type Utxo,
  get_keyhash,
  create_policy_script,
  get_policy_id,
} from "@studiowebux/cardano";

import { string_to_bytes } from "../src/util/encode.ts";

export const wallet = {
  skey: "ed25519_sk186akh5e8hn9hg4dwrs278cxvzxt5380ug5y5vg9mkwr9cmg60m9sqs0edm",
  skey_hex: "3ebb6bd327bccb7455ae1c15e3e0cc1197489dfc45094620bbb3865c6d1a7ecb",
  pkey: "ed25519_pk1g98fhsylcvkj7nv87xc54pdaetnvd800pmzm4wwvgwh92cgrn3cs42wmt4",
  pkey_hex: "414e9bc09fc32d2f4d87f1b14a85bdcae6c69def0ec5bab9cc43ae5561039c71",
  key_hash: "36ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad",
  address_preview:
    "addr_test1vqmw6ykve3n5qwtyezmr2z2az6vefw7p7xqjv9s3pwngptgw9n7x9",
  address_preprod:
    "addr_test1vqmw6ykve3n5qwtyezmr2z2az6vefw7p7xqjv9s3pwngptgw9n7x9",
  address_mainnet: "addr1vymw6ykve3n5qwtyezmr2z2az6vefw7p7xqjv9s3pwngptg4d8zfq",
};

export const policy = {
  skey: "ed25519_sk1arkfkgt39n8ew46shp7zkq9cavtry5lr6c9h8f6uv4zqs69jqwgqf60j3l",
  skey_hex: "e8ec9b21712ccf975750b87c2b00b8eb163253e3d60b73a75c65440868b20390",
  pkey: "ed25519_pk1kqgez66jpxr0sjyuszv87vf2wvrtug92gjxtcytnvfs4ynkpgussx3x3r9",
  pkey_hex: "b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec14721",
  key_hash: "8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9",
  address_preview:
    "addr_test1vz8cd3uxylxsr60juw9tghdcc2082m26ruhvm9y69m70twge0a2kq",
  address_preprod:
    "addr_test1vz8cd3uxylxsr60juw9tghdcc2082m26ruhvm9y69m70twge0a2kq",
  address_mainnet: "addr1vx8cd3uxylxsr60juw9tghdcc2082m26ruhvm9y69m70twgz8fke9",
};

const policy_script = create_policy_script(get_keyhash(policy.skey)!, 0, false);

export const utxos: Utxo[] = [
  {
    address: "addr_test1vqmw6ykve3n5qwtyezmr2z2az6vefw7p7xqjv9s3pwngptgw9n7x9",
    tx_hash: "099aaff33d5380f85743917e252a401748129be0fd7bc2f3a5f09c4f7e89d87d",
    output_index: 5,
    amount: [{ unit: "lovelace", quantity: "1000000" }],
  },
  {
    address: "addr_test1vqmw6ykve3n5qwtyezmr2z2az6vefw7p7xqjv9s3pwngptgw9n7x9",
    tx_hash: "2c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef",
    output_index: 1,
    amount: [
      { unit: "lovelace", quantity: "10000000" },
      {
        unit:
          get_policy_id(policy_script.mint_script) +
          string_to_bytes("default_character").toString("hex"),
        quantity: "1",
      },
    ],
  },
];
