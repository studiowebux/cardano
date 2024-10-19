import { assertEquals } from "@std/assert";
import { create_cip27_mint } from "../example/cip27.csl.ts";
import { policy, utxos, wallet } from "./keys.ts";
import {
  create_policy_script,
  format_cip27,
  get_keyhash,
  get_private_key,
} from "@studiowebux/cardano";

const policy_script = create_policy_script(get_keyhash(policy.skey)!, 0, false);

Deno.test("Create CIP27 transaction", () => {
  const tx = create_cip27_mint(
    wallet.address_preprod,
    format_cip27("0.05", wallet.address_preprod),
    policy_script.mint_script,
    utxos, // you should get the utxos from db sync, blockfrost or customer wallet.
    50000, // You have to get the current tip and add the number of slots desired
    get_private_key(policy.skey)!,
    get_private_key(wallet.skey)!,
    849070, // set minimum fee
  );

  assertEquals(
    tx.tx_signed,
    "84a600d90102818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018382581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a00111958a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a1400182581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a000cf4ae82581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0077b7e9a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a0002d0910319c35007582079baee751eaa8e44a753726c8dd2c4d039217d229233c170c8593cfe55f575e409a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a14001a200d9010282825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec147215840a056db6a1794915e2afb3af273f88152ccdb2570db44c7116a07687530e062639915b73f03a49956d4b0d7d5c0e00a35758212e72150b6792ef3c6b620af7f00825820414e9bc09fc32d2f4d87f1b14a85bdcae6c69def0ec5bab9cc43ae5561039c715840ffe6d58ccef258e0aee33c706350746a173b4afda296da0ffd6b52e40a2cdc064191a224a4900ff6d06a38d6fb226b9ed5eb463aeb320953faf2e665831e040601d90102818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5a1190309a26461646472783f616464725f746573743176716d7736796b7665336e3571777479657a6d72327a32617a367665667737703778716a7639733370776e6770746777396e377839647261746564302e3035",
  );
});
