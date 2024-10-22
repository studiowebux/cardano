import { assertEquals } from "@std/assert";
import {
  create_policy_script,
  format_cip25,
  get_keyhash,
  get_private_key,
  get_policy_id,
} from "@studiowebux/cardano";

import {
  create_cip25_mint,
  create_cip25_burns_with_rewards_no_metadata,
  create_cip25_burn_with_metadata,
} from "../example/cip25.csl.ts";

import { policy, utxos, wallet } from "./keys.ts";

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
      "84a500d90102818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018282581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a001e848082581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a00776167a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a0002b0990319c3500758201bfd745bdb1f8902989622ea2bb7ac02568147821c68e2cbe561d8e15e5afbdca200d9010281825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec14721584020434bb3726b9e228f01c2ec6538dbf45837bf3d8c976eb1af1dee3fd4a9a8a0a0de6e94275851250ca034750225e9e7dcc271ab01fc92e2d87ee326172c170501d90102818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5f6",
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
      "84a500d90102818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018282581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a001e848082581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a00776167a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a0002b0990319c3500758201bfd745bdb1f8902989622ea2bb7ac02568147821c68e2cbe561d8e15e5afbdca200d9010281825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec14721584020434bb3726b9e228f01c2ec6538dbf45837bf3d8c976eb1af1dee3fd4a9a8a0a0de6e94275851250ca034750225e9e7dcc271ab01fc92e2d87ee326172c170501d90102818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5a11902d1a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a17634613734363537333734356636333639373033323335a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d656a74657374206369703235",
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
    "84a500d90102818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018282581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a003d090082581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0058c2c7a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a0002cab90319c350075820b7e5857ce64cfe3fed476d10f8bdd7948a01137bad3b02dfb3540e1f715aec04a200d9010281825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec14721584064533e42a8c66f5ce742da02ad8bde8baa4225cb7594bbc39ed9aa140c05f557b4908eec0e4294c9e46e618b90d56b57405b79a44f8ab21a741180ab3eddae0a01d90102818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5a11902d182a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a17634613734363537333734356636333639373033323335a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d656a74657374206369703235a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a1781a3463373436353733373435663633363937303332333535663332a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d656d74657374206369703235202332",
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
    "84a400d90102818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a00960b5fa1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a00028b210319c350a200d9010281825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec14721584018174d04471d96ca726445b9b8e6fe87d2239e94aff789b98934397f2e245900e219dd9dbd6f8584cc1f4559c38fc122e067967f0342f486c06de91ffc1dde0101d90102818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5f6",
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
    "84a500d90102818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0095e8ffa1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a0002ad810319c350075820fe033fd2caa1cc09d031e4c14f0a05d020c993ebf31dde8a5ca9b480a547de3ba200d9010281825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec147215840bd28c992032ff90aadb8aae19e4c57396ae3570c90b07d59e45d9fd4279a21e95f21315320358a04191bdf3b868915e2586a5eb7d235b183be2741ebb413950701d90102818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5f6",
  );

  assertEquals(
    output.full_tx,
    "84a500d90102818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0095e8ffa1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a0002ad810319c350075820fe033fd2caa1cc09d031e4c14f0a05d020c993ebf31dde8a5ca9b480a547de3ba200d9010281825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec147215840bd28c992032ff90aadb8aae19e4c57396ae3570c90b07d59e45d9fd4279a21e95f21315320358a04191bdf3b868915e2586a5eb7d235b183be2741ebb413950701d90102818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5a11902d1a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a1782235303632363537343734363537323566363336383631373236313633373436353732a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d657042657474657220436861726163746572",
  );
});
