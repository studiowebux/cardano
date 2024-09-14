import {
  type NativeScript,
  type PrivateKey,
  NetworkId,
} from "@emurgo/cardano-serialization-lib-nodejs";
import {
  type Utxo,
  type CIP25Formatted,
  TxBuilder,
} from "@studiowebux/cardano";

export function create_cip25_mint(
  sender_address: string,
  receiver_address: string,
  nft_cost_in_lovelace: number,
  assets: { metadata: CIP25Formatted; asset_name: string }[],
  mint_script: NativeScript,
  utxos: Utxo[],
  policy_ttl: number,
  ttl: number,
  policy_skey: PrivateKey,
  hide_metadata: boolean = true,
) {
  const tx_builder = new TxBuilder()
    .with_hide_metadata(hide_metadata)
    .with_receiver_address(receiver_address)
    .with_nft_cost_in_lovelace(nft_cost_in_lovelace)
    .with_sender_address(sender_address)
    .with_utxos(utxos)
    .build();

  tx_builder.parse_utxos();

  assets.forEach((asset) => {
    tx_builder.add_mint_or_burn_asset(mint_script, asset.asset_name, 1);
  });

  tx_builder.add_json_metadata({
    "721": assets.map((asset) => asset.metadata[721]).flat(),
  });

  tx_builder
    .add_output()
    .set_ttl(ttl)
    .add_inputs()
    .build_body_and_hash()
    .policy_witness([mint_script], [policy_skey])
    .add_signers()
    .set_network_id(NetworkId.testnet())
    .build_tx()
    .assemble_tx()
    .remove_metadata();

  return {
    tx_hash: tx_builder.get_hash()?.to_hex(),
    tx_body: tx_builder.get_body()?.to_hex(),
    policy_ttl,
    receiver_address,
    assets,
    tx_to_sign: tx_builder.get_tx_to_sign()?.to_hex(),
    full_tx: tx_builder.get_assembled_tx()?.to_hex(),
  };
}

export function create_cip25_burns_with_rewards_no_metadata(
  receiver_address: string,
  rewards: {
    mint_script: NativeScript;
    asset_name: string;
    quantity: number;
  }[], // output
  burns: {
    mint_script: NativeScript;
    asset_name: string;
    quantity: number;
  }[], // input
  input_mint_script: NativeScript,
  output_mint_script: NativeScript,
  utxos: Utxo[],
  policy_ttl: number,
  ttl: number,
  input_policy_skey: PrivateKey,
  output_policy_skey: PrivateKey,
) {
  const tx_builder = new TxBuilder()
    .with_sender_address(receiver_address)
    .with_receiver_address(receiver_address)
    .with_utxos(utxos)
    .build();

  tx_builder
    .parse_utxos()
    .add_mint_or_burn_assets(burns)
    .add_mint_or_burn_assets(rewards)
    .set_ttl(ttl)
    .add_inputs()
    .build_body_and_hash()
    .policy_witness(
      [input_mint_script, output_mint_script],
      [input_policy_skey, output_policy_skey],
    )
    .add_signers()
    .set_network_id(NetworkId.testnet()) // HARDCODED
    .build_tx()
    .assemble_tx();

  return {
    tx_hash: tx_builder.get_hash()?.to_hex(),
    tx_body: tx_builder.get_body()?.to_hex(),
    policy_ttl,
    receiver_address,
    tx_to_sign: tx_builder.get_assembled_tx()?.to_hex(),
  };
}

export function create_cip25_burn_with_metadata(
  receiver_address: string,
  rewards: {
    mint_script: NativeScript;
    asset_name: string;
    quantity: number;
  }[], // output
  burns: {
    mint_script: NativeScript;
    asset_name: string;
    quantity: number;
  }[], // input
  input_mint_script: NativeScript,
  output_mint_script: NativeScript,
  metadata: CIP25Formatted,
  utxos: Utxo[],
  policy_ttl: number,
  ttl: number,
  input_policy_skey: PrivateKey,
  output_policy_skey: PrivateKey,
  hide_metadata: boolean = true,
) {
  const tx_builder = new TxBuilder()
    .with_hide_metadata(hide_metadata)
    .with_sender_address(receiver_address)
    .with_receiver_address(receiver_address)
    .with_utxos(utxos)
    .build();

  tx_builder
    .parse_utxos()
    .add_mint_or_burn_assets(burns)
    .add_mint_or_burn_assets(rewards)
    .add_json_metadata(metadata)
    .set_ttl(ttl)
    .add_inputs()
    .build_body_and_hash()
    .policy_witness(
      [input_mint_script, output_mint_script],
      [input_policy_skey, output_policy_skey],
    )
    .add_signers()
    .set_network_id(NetworkId.testnet()) // HARDCODED
    .build_tx()
    .assemble_tx()
    .remove_metadata();

  return {
    tx_hash: tx_builder.get_hash()?.to_hex(),
    tx_body: tx_builder.get_body()?.to_hex(),
    policy_ttl,
    receiver_address,
    tx_to_sign: tx_builder.get_tx_to_sign()?.to_hex(),
    full_tx: tx_builder.get_assembled_tx()?.to_hex(),
  };
}
