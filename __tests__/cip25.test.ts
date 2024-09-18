import {
  create_cip25_mint,
  create_cip25_burns_with_rewards_no_metadata,
  create_cip25_burn_with_metadata,
} from "../example/cip25.csl.ts";
import {
  create_policy_script,
  format_cip25,
  get_keyhash,
  get_private_key,
} from "@studiowebux/cardano";
import { policy, utxos, wallet } from "./keys.ts";
import { get_policy_id } from "../src/csl/policy.csl.ts";
import { assertEquals } from "@std/assert";

const policy_script = create_policy_script(get_keyhash(policy.skey)!, 0, false);

const mint = format_cip25(
  { name: "test cip25", image: "http://localhost", mediaType: "image/png" },
  "test_cip25",
  get_policy_id(policy_script.mint_script),
);

const mint_2 = format_cip25(
  { name: "test cip25 #2", image: "http://localhost", mediaType: "image/png" },
  "test_cip25_2",
  get_policy_id(policy_script.mint_script),
);

const better_character = format_cip25(
  {
    name: "Better Character",
    image: "http://localhost",
    mediaType: "image/png",
  },
  "better_character",
  get_policy_id(policy_script.mint_script),
);

Deno.test(
  "Create CIP25 transaction minting 1 asset and checking tx to signed (without metadata)",
  () => {
    const output = create_cip25_mint(
      wallet.address_preprod,
      wallet.address_preprod, // send nft on itself, usually it can be the target address.
      2_000_000 * 1,
      [{ asset_name: "test_cip25", metadata: mint }],
      policy_script.mint_script,
      utxos,
      policy_script.policy_ttl,
      50000,
      get_private_key(policy.skey)!,
      true,
    );

    assertEquals(
      output.tx_to_sign,
      "84a600818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018382581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0011c1b4a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a14a746573745f63697032350182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a001e848082581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0065732fa1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a0002dd1d0319c3500758201bfd745bdb1f8902989622ea2bb7ac02568147821c68e2cbe561d8e15e5afbdc09a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a14a746573745f636970323501a20081825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec14721584013d5f6548ebbb6da607fc2bb583e2de48fd3e4180a4899effca28aec5db27847e040d8ebf6dd94caa624844d16400d766a214e4527435749d30c18e88be9a60701818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5f6",
    );
  },
);

Deno.test(
  "Create CIP25 transaction minting 1 asset and checking full tx (with metadata)",
  () => {
    const output = create_cip25_mint(
      wallet.address_preprod,
      wallet.address_preprod, // send nft on itself, usually it can be the target address.
      2_000_000 * 1,
      [{ asset_name: "test_cip25", metadata: mint }],
      policy_script.mint_script,
      utxos,
      policy_script.policy_ttl,
      50000,
      get_private_key(policy.skey)!,
      true,
    );

    assertEquals(
      output.full_tx,
      "84a600818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018382581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0011c1b4a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a14a746573745f63697032350182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a001e848082581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0065732fa1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a0002dd1d0319c3500758201bfd745bdb1f8902989622ea2bb7ac02568147821c68e2cbe561d8e15e5afbdc09a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a14a746573745f636970323501a20081825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec14721584013d5f6548ebbb6da607fc2bb583e2de48fd3e4180a4899effca28aec5db27847e040d8ebf6dd94caa624844d16400d766a214e4527435749d30c18e88be9a60701818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5a11902d1a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a17634613734363537333734356636333639373033323335a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d656a74657374206369703235",
    );
  },
);

Deno.test("Create CIP25 transaction minting 2 assets", () => {
  const output = create_cip25_mint(
    wallet.address_preprod,
    wallet.address_preprod, // send nft on itself, usually it can be the target address.
    2_000_000 * 2,
    [
      { asset_name: "test_cip25", metadata: mint },
      { asset_name: "test_cip25_2", metadata: mint_2 },
    ],
    policy_script.mint_script,
    utxos,
    policy_script.policy_ttl,
    50000,
    get_private_key(policy.skey)!,
    true,
  );

  assertEquals(
    output.full_tx,
    "84a600818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018482581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0011c1b4a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a14a746573745f63697032350182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0011e360a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a14c746573745f63697032355f320182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a003d090082581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0034e057a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a000308150319c350075820b7e5857ce64cfe3fed476d10f8bdd7948a01137bad3b02dfb3540e1f715aec0409a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a24a746573745f6369703235014c746573745f63697032355f3201a20081825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec1472158409059434140f91614764f5c13eb27a0d8cb98e797ed763a3820253a204ee4e064842426e514f08b7b7b973e437d77bb616f3af99ea5012994c641296a4a2ccc0401818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5a11902d182a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a17634613734363537333734356636333639373033323335a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d656a74657374206369703235a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a1781a3463373436353733373435663633363937303332333535663332a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d656d74657374206369703235202332",
  );
});

Deno.test("create_cip25_burns_with_rewards_no_metadata", () => {
  const output = create_cip25_burns_with_rewards_no_metadata(
    wallet.address_preprod,
    [
      {
        mint_script: policy_script.mint_script,
        asset_name: "better_character",
        quantity: 1,
      },
    ],
    [
      {
        mint_script: policy_script.mint_script,
        asset_name: "default_character",
        quantity: -1,
      },
    ],
    policy_script.mint_script,
    policy_script.mint_script,
    utxos,
    0,
    50000,
    get_private_key(policy.skey)!,
    get_private_key(policy.skey)!,
  );

  assertEquals(
    output.tx_to_sign,
    "84a500818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018282581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a001226b8a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a1506265747465725f6368617261637465720182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a0083bbbf021a0002b4090319c35009a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a2506265747465725f636861726163746572015164656661756c745f63686172616374657220a20081825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec147215840c0f990d7e4221ad4e725f585f7a63314a017c478cc557afeb584f96a8475a3917fb9072d8565ff6d70d75d8a594de5187aaa3ac45cd34b163c0cfe36b9203b0301818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5f6",
  );
});

Deno.test("create_cip25_burn_with_metadata", () => {
  const output = create_cip25_burn_with_metadata(
    wallet.address_preprod,
    [
      {
        mint_script: policy_script.mint_script,
        asset_name: "better_character",
        quantity: 1,
      },
    ],
    [
      {
        mint_script: policy_script.mint_script,
        asset_name: "default_character",
        quantity: -1,
      },
    ],
    policy_script.mint_script,
    policy_script.mint_script,
    better_character,
    utxos,
    0,
    50000,
    get_private_key(policy.skey)!,
    get_private_key(policy.skey)!,
    true,
  );

  assertEquals(
    output.tx_to_sign,
    "84a600818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018282581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a001226b8a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a1506265747465725f6368617261637465720182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a0083995f021a0002d6690319c350075820fe033fd2caa1cc09d031e4c14f0a05d020c993ebf31dde8a5ca9b480a547de3b09a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a2506265747465725f636861726163746572015164656661756c745f63686172616374657220a20081825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec1472158405bd1828955701a5741c35ec77061ed847d1f44573545e9e820532e54e25ef1db2b62a7ed1a7d7915b12017476850271856fa6c23a695b032626253b110f4ad0101818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5f6",
  );

  assertEquals(
    output.full_tx,
    "84a600818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018282581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a001226b8a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a1506265747465725f6368617261637465720182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a0083995f021a0002d6690319c350075820fe033fd2caa1cc09d031e4c14f0a05d020c993ebf31dde8a5ca9b480a547de3b09a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a2506265747465725f636861726163746572015164656661756c745f63686172616374657220a20081825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec1472158405bd1828955701a5741c35ec77061ed847d1f44573545e9e820532e54e25ef1db2b62a7ed1a7d7915b12017476850271856fa6c23a695b032626253b110f4ad0101818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5a11902d1a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a1782235303632363537343734363537323566363336383631373236313633373436353732a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d657042657474657220436861726163746572",
  );
});
