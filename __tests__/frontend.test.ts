import { NetworkId } from "@emurgo/cardano-serialization-lib-nodejs";
import { assertEquals } from "@std/assert";
import {
  format_cip25,
  get_asset_name_v2,
  get_keyhash,
  get_private_key,
  create_policy_script,
  get_policy_id,
  Tx,
} from "@studiowebux/cardano";

import { policy } from "./keys.ts";

const policy_script = create_policy_script(get_keyhash(policy.skey)!, 0, false);

const mint = format_cip25(
  { name: "test cip25", image: "http://localhost", mediaType: "image/png" },
  get_asset_name_v2("test_cip20"),
  get_policy_id(policy_script.mint_script),
);

Deno.test(
  "cip20 - testing frontend integration after csl upgrade - with metadata",
  () => {
    const tx_builder = new Tx(
      "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
      "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
      [
        {
          address:
            "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
          tx_hash:
            "8063c1dd9c1cc3c75f30fae5861399b40084a454c57a5ae449189ee7b890e43c",
          output_index: 0,
          amount: [{ unit: "lovelace", quantity: "1000000000" }],
        },
      ],
      0,
      undefined,
      false,
    );

    tx_builder
      .add_tx_metadata(["Bought with Cardano Webux Lib"])
      .add_json_metadata(mint)
      .parse_utxos()
      .set_ttl(50000)
      .add_inputs()
      .build_body_and_hash()
      .policy_witness([], [get_private_key(policy.skey)])
      .add_signers()
      .set_network_id(NetworkId.testnet()) // HARDCODED
      .build_tx()
      .remove_metadata()
      .assemble_tx();

    assertEquals(
      tx_builder.get_assembled_tx()?.to_hex(),
      "84a500d90102818258208063c1dd9c1cc3c75f30fae5861399b40084a454c57a5ae449189ee7b890e43c000181825839000c588bbd1efe0732815c3ecee3e432e36b654a2eac1ea74c4d847f5882405717f6d8b7d7a8bdd275700161548db5c6ea38a5ae5964df6ed91a3b9818b7021a0002b1490319c35007582065b9c60299c20e17d14258f57164f4ca23a212ded2ef28506da9d30272c3915aa100d9010281825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec1472158400f92c456753ffe1669f6a079554e4c8f8ebda0edad02c703e4467bae534b46fa7a4bda2c9c17887eed44f3b1ed16fb597550be4acd5d76132d09d837b9b02106f5a21902a2a1636d736781781d426f7567687420776974682043617264616e6f205765627578204c69621902d1a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a1782e35363334363133373334333633353337333333373334333536363336333333363339333733303333333233333330a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d656a74657374206369703235",
    );
    // Get Hash
    assertEquals(
      tx_builder.get_hash()?.to_hex(),
      "683fda8635b01a9b1e0f382d3c049ee2404c4677e088f0543ca0e306733a73dd",
    );
  },
);

Deno.test(
  "useless TX - testing frontend integration after csl upgrade - NO metadata",
  () => {
    const tx_builder = new Tx(
      "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
      "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
      [
        {
          address:
            "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
          tx_hash:
            "8063c1dd9c1cc3c75f30fae5861399b40084a454c57a5ae449189ee7b890e43c",
          output_index: 0,
          amount: [{ unit: "lovelace", quantity: "1000000000" }],
        },
      ],
      0,
      undefined,
      true,
    );

    tx_builder
      .parse_utxos()
      .set_ttl(50000)
      .add_inputs()
      .build_body_and_hash()
      .policy_witness([], [get_private_key(policy.skey)])
      .add_signers()
      .set_network_id(NetworkId.testnet()) // HARDCODED
      .build_tx()
      .remove_metadata()
      .assemble_tx();

    assertEquals(
      tx_builder.get_assembled_tx()?.to_hex(),
      "84a400d90102818258208063c1dd9c1cc3c75f30fae5861399b40084a454c57a5ae449189ee7b890e43c000181825839000c588bbd1efe0732815c3ecee3e432e36b654a2eac1ea74c4d847f5882405717f6d8b7d7a8bdd275700161548db5c6ea38a5ae5964df6ed91a3b9842ff021a000287010319c350a100d9010281825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec14721584013358bdabcad6a1d1e8f3622c4398c843f539d3d1cdf7498f22ced3bc8b8dbe138ade82be4005db6e364841d9fdc3f79fb2000b8a1507656fcf830895391b506f5f6",
    );
    // Get Hash
    assertEquals(
      tx_builder.get_hash()?.to_hex(),
      "1e3a754b356bfb1d6523f3ea4aeb0b4767c085954d5778a464a05a3f697a1370",
    );
  },
);

Deno.test(
  "cip20 - testing frontend integration after csl upgrade - with hidden metadata",
  () => {
    const tx_builder = new Tx(
      "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
      "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
      [
        {
          address:
            "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
          tx_hash:
            "8063c1dd9c1cc3c75f30fae5861399b40084a454c57a5ae449189ee7b890e43c",
          output_index: 0,
          amount: [{ unit: "lovelace", quantity: "1000000000" }],
        },
      ],
      0,
      undefined,
      true,
    );

    tx_builder
      .add_tx_metadata(["Bought with Cardano Webux Lib"])
      .add_json_metadata(mint)
      .parse_utxos()
      .set_ttl(50000)
      .add_inputs()
      .build_body_and_hash()
      .policy_witness([], [get_private_key(policy.skey)])
      .add_signers()
      .set_network_id(NetworkId.testnet()) // HARDCODED
      .build_tx()
      .remove_metadata() // Must call this function to be able to use: get_tx_to_sign
      .assemble_tx();

    // Metadata is hidden
    assertEquals(
      tx_builder.get_tx_to_sign()?.to_hex(),
      "84a500d90102818258208063c1dd9c1cc3c75f30fae5861399b40084a454c57a5ae449189ee7b890e43c000181825839000c588bbd1efe0732815c3ecee3e432e36b654a2eac1ea74c4d847f5882405717f6d8b7d7a8bdd275700161548db5c6ea38a5ae5964df6ed91a3b9818b7021a0002b1490319c35007582065b9c60299c20e17d14258f57164f4ca23a212ded2ef28506da9d30272c3915aa100d9010281825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec1472158400f92c456753ffe1669f6a079554e4c8f8ebda0edad02c703e4467bae534b46fa7a4bda2c9c17887eed44f3b1ed16fb597550be4acd5d76132d09d837b9b02106f5f6",
    );
    // Full tx (you will have to append the signature to this TX)
    assertEquals(
      tx_builder.get_assembled_tx()?.to_hex(),
      "84a500d90102818258208063c1dd9c1cc3c75f30fae5861399b40084a454c57a5ae449189ee7b890e43c000181825839000c588bbd1efe0732815c3ecee3e432e36b654a2eac1ea74c4d847f5882405717f6d8b7d7a8bdd275700161548db5c6ea38a5ae5964df6ed91a3b9818b7021a0002b1490319c35007582065b9c60299c20e17d14258f57164f4ca23a212ded2ef28506da9d30272c3915aa100d9010281825820b011916b520986f8489c80987f312a7306be20aa448cbc11736261524ec1472158400f92c456753ffe1669f6a079554e4c8f8ebda0edad02c703e4467bae534b46fa7a4bda2c9c17887eed44f3b1ed16fb597550be4acd5d76132d09d837b9b02106f5a21902a2a1636d736781781d426f7567687420776974682043617264616e6f205765627578204c69621902d1a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a1782e35363334363133373334333633353337333333373334333536363336333333363339333733303333333233333330a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d656a74657374206369703235",
    );
    // With Metadata, but unsigned
    assertEquals(
      tx_builder.get_unsigned_tx()?.to_hex(),
      "84a500d90102818258208063c1dd9c1cc3c75f30fae5861399b40084a454c57a5ae449189ee7b890e43c000181825839000c588bbd1efe0732815c3ecee3e432e36b654a2eac1ea74c4d847f5882405717f6d8b7d7a8bdd275700161548db5c6ea38a5ae5964df6ed91a3b9818b7021a0002b1490319c35007582065b9c60299c20e17d14258f57164f4ca23a212ded2ef28506da9d30272c3915aa0f5a21902a2a1636d736781781d426f7567687420776974682043617264616e6f205765627578204c69621902d1a178383265303130306130613038666534643961613131666132393034653338643065363532306131356439353533343935636262616238663631a1782e35363334363133373334333633353337333333373334333536363336333333363339333733303333333233333330a365696d61676570687474703a2f2f6c6f63616c686f7374696d656469615479706569696d6167652f706e67646e616d656a74657374206369703235",
    );
    // Get Hash
    assertEquals(
      tx_builder.get_hash()?.to_hex(),
      "683fda8635b01a9b1e0f382d3c049ee2404c4677e088f0543ca0e306733a73dd",
    );
  },
);
