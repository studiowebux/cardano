import {
  format_cip25,
  get_asset_name_v2,
  get_keyhash,
  get_private_key,
  create_policy_script,
  get_policy_id,
} from "@studiowebux/cardano";
import { utxos, wallet } from "./keys.ts";
import { policy } from "./keys.ts";
import { NetworkId } from "@emurgo/cardano-serialization-lib-nodejs";
import { assertEquals } from "@std/assert";
import { Tx } from "../src/csl/tx_builder.lib.ts";

const policy_script = create_policy_script(get_keyhash(policy.skey)!, 0, false);

const mint = format_cip25(
  { name: "test cip25", image: "http://localhost", mediaType: "image/png" },
  get_asset_name_v2("test_cip20"),
  get_policy_id(policy_script.mint_script),
);

Deno.test("cip20 + cip86", () => {
  const tx_builder = new Tx(
    wallet.address_preprod,
    wallet.address_preprod,
    utxos,
    0,
    undefined,
    false,
  );

  tx_builder.add_tx_metadata(["Bought on Daogora"]);
  tx_builder.add_json_metadata(mint);

  tx_builder.assign_metadata_oracle(
    get_policy_id(policy_script.mint_script),
    "addr_test1vzg4qxmfmtxxw00s7sx6dkcyx9fr89mvmlwhq0r3xumqudshulz9c", // main, address used to sign the tx to update metadata of an asset in the specified policy id
    "addr_test1vrm2hqmec43vr7ulsdndq2sp0rht2k5nj4gwt7y0hx64hysse3cpr", // update, address used to update the main address
  );

  tx_builder.simple_metadata_update(
    get_policy_id(policy_script.mint_script),
    get_asset_name_v2("test_cip20"),
    { XP: 100, exploration: 1 },
  );

  tx_builder
    .parse_utxos()
    .set_ttl(50000)
    .add_inputs()
    .build_body_and_hash()
    .policy_witness([], [get_private_key(policy.skey)]) // FIXME: the cip-86 main address signature is missing.
    .add_signers()
    .set_network_id(NetworkId.testnet()) // HARDCODED
    .build_tx()
    .assemble_tx();

  assertEquals(
    tx_builder.get_assembled_tx()?.to_hex(),
    "84a500818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0095cccfa1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a0002c9b10319c35007582079a97fe1397fa3c6ade654a3343e3b185458df6466ae215ab30cd43ef348d733a10081825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec147215840c97c6b47f215ced49c3d569bdd08f5b079bb23e7269293c0d7e787509d7186f99932196e99efacf2ef669da253828204bd737b634d22558de4368ab880666c06f5a31902a2a1636d73678171426f75676874206f6e2044616f676f72611902d1a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a1782e35363334363133373334333633353337333333373334333536363336333333363339333733303333333233333330a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d656a746573742063697032351856a27673696d706c655f6d657461646174615f757064617465a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a17634613734363537333734356636333639373033323330a262585018646b6578706c6f726174696f6e016776657273696f6e02",
  );
});
