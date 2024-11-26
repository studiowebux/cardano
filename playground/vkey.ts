import {
  PublicKey,
  Credential,
  EnterpriseAddress,
  NetworkInfo,
} from "@emurgo/cardano-serialization-lib-nodejs";
import { assertEquals } from "@std/assert";

Deno.test("Testing vkey operations", () => {
  // Key used to sign the TX
  // From Address: addr_test1vqfe3zd3ppwpteuutqxc7g4fxk65tr5x0dv2pdkg0swvmlqpsvuxw
  // From PKEY: ed25519_pk1majw0h3wtwf8fhyc90eh36ya357nln7w0q0lyetj2sg8pvnnqymsxa97tk

  // Key stored on chain (from ogmios block in the signatories object)
  const vkey =
    "df64e7de2e5b9274dc982bf378e89d8d3d3fcfce781ff26572541070b2730137";

  // Trying to reserve (simulating not having who signed what to get back the original address)
  console.log(
    "1: ",
    PublicKey.from_bech32(
      "ed25519_pk1majw0h3wtwf8fhyc90eh36ya357nln7w0q0lyetj2sg8pvnnqymsxa97tk",
    ).to_hex(),
  );
  console.log("2: ", PublicKey.from_hex(vkey).to_bech32()); // This one returns the expected value.
  console.log(
    "4: ",
    EnterpriseAddress.new(
      NetworkInfo.testnet_preprod().network_id(),
      Credential.from_keyhash(PublicKey.from_hex(vkey).hash()),
    )
      .to_address()
      .to_bech32(),
  ); // reverse the key stored in ogmios to get back a bech32 address

  // Output
  // 1:  df64e7de2e5b9274dc982bf378e89d8d3d3fcfce781ff26572541070b2730137
  // 2:  ed25519_pk1majw0h3wtwf8fhyc90eh36ya357nln7w0q0lyetj2sg8pvnnqymsxa97tk
  // 4:  addr_test1vqfe3zd3ppwpteuutqxc7g4fxk65tr5x0dv2pdkg0swvmlqpsvuxw
});
