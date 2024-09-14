import { get_slot_api, get_utxos_api, TxBuilder } from "@studiowebux/cardano";

const blockfrost_url = "http://192.168.20.105:3010";
const blockfrost_api_key = "not_used";

async function send_ada() {
  const tx_builder = new TxBuilder()
    .with_receiver_address(
      "addr_test1qqu4ydw6df5y6sda5l3xljnmjqxvtsa0sjhw5swsjy6vele0sga4nc2my67vj32wu2hlk8vneau302az6j4y92nfwu0sw9zcd9",
    )
    .with_sender_address(
      "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
    )
    .with_utxos(
      await get_utxos_api(
        blockfrost_url,
        blockfrost_api_key,
        "addr_test1qqx93zaarmlqwv5ptslvaclyxt3kke2296kpaf6vfkz87kyzgpt30akcklt630wjw4cqzc253k6ud63c5kh9jexldmvs0h7dq6",
      ),
    )
    .with_ada_to_send(5_000_000)
    .build();
  const tip_slot =
    (await get_slot_api(blockfrost_url, blockfrost_api_key)) + 50_000;
  tx_builder
    .add_tx_metadata(["Sent using webux cardano tx builder"])
    .parse_utxos()
    .set_ttl(tip_slot + 50_000)
    .add_output() // Send 5 ADA to receiver address
    .add_inputs()
    .build_body_and_hash()
    .add_signers()
    .build_tx()
    .assemble_tx();

  console.log(tx_builder.get_assembled_tx()?.to_hex());
}

await send_ada();

// Then in your browser console:
// const n = await window.cardano.nami.enable()
// await n.signTx("84a500818258209169aac56c7437c34a95905c684daeb85e3e502e2cbca7d68706f66e018a9d9900018282583900395235da6a684d41bda7e26fca7b900cc5c3af84aeea41d09134ccff2f823b59e15b26bcc9454ee2affb1d93cf7917aba2d4aa42aa69771f1a004c4b40825839000c588bbd1efe0732815c3ecee3e432e36b654a2eac1ea74c4d847f5882405717f6d8b7d7a8bdd275700161548db5c6ea38a5ae5964df6ed91a3b4bdf57021a00029f69031a0001c29c07582097b9aca0f75f27cae8f41c8806f8f7ec5ad13e5f68735725a57d5ad2b206b1e6a0f5a11902a2a1636d736781782353656e74207573696e672077656275782063617264616e6f207478206275696c646572", true);

// then deno run -A submit.test.ts
