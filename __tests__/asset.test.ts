import { assertEquals } from "@std/assert";
import { AssetName } from "@emurgo/cardano-serialization-lib-nodejs";
import { string_to_uint8, uint8_to_string } from "@studiowebux/cardano";

Deno.test("Asset name", () => {
  const asset_name = "my_character";

  assertEquals(
    AssetName.new(string_to_uint8(asset_name)).name(),
    new Uint8Array([109, 121, 95, 99, 104, 97, 114, 97, 99, 116, 101, 114]),
  );

  assertEquals(
    uint8_to_string(AssetName.new(string_to_uint8(asset_name)).name()),
    asset_name,
  );
});
