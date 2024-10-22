import { assertEquals } from "@std/assert";
import {
  create_policy_script,
  format_cip27,
  get_keyhash,
  get_private_key,
} from "@studiowebux/cardano";

import { create_cip27_mint } from "../example/cip27.csl.ts";
import { policy, utxos, wallet } from "./keys.ts";

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
    "84a500d90102818258202c71e0fcfb0205fa26c40599af749210213ffbb0f82f607bd9667d095b0966ef01018282581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad1a000cf4ae82581d6036ed12cccc67403964c8b635095d169994bbc1f1812616110ba680ad821a0088fbe1a1581c2e0100a0a08fe4d9aa11fa2904e38d0e6520a15d9553495cbbab8f61a15164656661756c745f63686172616374657201021a0002a5f10319c35007582079baee751eaa8e44a753726c8dd2c4d039217d229233c170c8593cfe55f575e4a200d9010282825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec1472158408d119f2a5453c4ffadad07a3f3fb073d2a47cb7645b6ab7ece3635da9daff9c5e74ae01ed5915e773a47c12ff1f9fa0e4c779dd4b6d7a174ef8434121594c80d825820414e9bc09fc32d2f4d87f1b14a85bdcae6c69def0ec5bab9cc43ae5561039c715840a83270cb62279cefd4fef847c3d9d146ee67c3446e1a2e721c3c12adb4dfeb2bbf303ec957bc23bb2247380211f059147159328c2b857b07468bc5fb9edbf20201d90102818201818200581c8f86c78627cd01e9f2e38ab45db8c29e756d5a1f2ecd949a2efcf5b9f5a1190309a26461646472783f616464725f746573743176716d7736796b7665336e3571777479657a6d72327a32617a367665667737703778716a7639733370776e6770746777396e377839647261746564302e3035",
  );
});
