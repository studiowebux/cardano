import { assertEquals } from "@std/assert";
import {
  get_public_key_from_address,
  get_public_key_from_keyhash,
} from "../src/csl/wallet.csl.ts";
import { address_to_stake } from "../src/csl/wallet.csl.ts";

// NOTE: the addresses used below are from a random transaction

Deno.test("Get Keyhash using enterprise address", () => {
  const address = "addr1v9u7va2sktlnz8dp3qadpnxxlv4m03672jy6elmntlxxs7q9nnwl9";
  const pk = get_public_key_from_address(address);
  assertEquals(
    pk,
    "ed25519_pk1sgq9s8reue64pvhlxyw6rzp66rxvd7etklr4u4yf4nlhxh7vdpuq4e5yd8",
  );
});

Deno.test("Get Keyhash using base address", () => {
  const address =
    "addr1q8xyfjhlfrs9u8sy7g5ze7eh20qmjn4yfk406e8hkqv3lu2u7rcvyes0ymkgcmqjf6l3r66kdzf20a9aw38y4na5md6spxezhw";
  const pk = get_public_key_from_address(address);
  assertEquals(
    pk,
    "ed25519_pk1sgq9s8xvgn907j8qtc0qfu3g9nanw57ph982gnd2l4j00vqerlcs2yxrq4",
  );
});

Deno.test("get_public_key_from_keyhash", () => {
  const keyhash_from_ogmios =
    "6687a36f0a4b8abf2671f8affb7febeb8940e9ee83548d2a2924dbc74679c466";

  const pk = get_public_key_from_keyhash(keyhash_from_ogmios);
  assertEquals(
    pk,
    "ed25519_pk1v6r6xmc2fw9t7fn3lzhlklltawy5p60wsd2g623fynduw3nec3nqhrhlr6",
  );
});

Deno.test("address_to_stake", () => {
  const address =
    "addr1q8xyfjhlfrs9u8sy7g5ze7eh20qmjn4yfk406e8hkqv3lu2u7rcvyes0ymkgcmqjf6l3r66kdzf20a9aw38y4na5md6spxezhw";
  const stake = address_to_stake(address);
  assertEquals(
    stake,
    "stake1u9w0puxzvc8jdmyvdsfya0c3adtx3y487j7hgnj2e76dkagstklzh",
  );
});
