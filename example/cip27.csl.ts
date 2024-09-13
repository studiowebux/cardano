import {
  type NativeScript,
  type PrivateKey,
  NetworkId,
} from "@emurgo/cardano-serialization-lib-nodejs";
import {
  type CIP27Formatted,
  type Utxo,
  TxBuilder,
} from "@studiowebux/cardano";

export function create_cip27_mint(
  payment_address: string,
  metadata: CIP27Formatted,
  mint_script: NativeScript,
  utxos: Utxo[],
  ttl: string,
  policy_skey: PrivateKey,
  payment_skey: PrivateKey,
  amount_to_lock = 849070,
) {
  const tx_builder = new TxBuilder.Builder()
    .with_main_receiver_address(payment_address)
    .with_receiver_address(payment_address)
    .with_nft_cost_in_lovelace(amount_to_lock.toString())
    .with_utxos(utxos)
    .build();

  tx_builder
    .parse_utxos()
    .add_mint_or_burn_asset(mint_script, "", 1)
    .add_royalties(metadata)
    .add_output()
    .set_ttl(ttl)
    .add_inputs()
    .build_body_and_hash()
    .policy_witness([mint_script], [policy_skey, payment_skey])
    .add_signers()
    .set_network_id(NetworkId.testnet()) // HARDCODED.
    .build_tx()
    .assemble_tx();

  return {
    tx_hash: tx_builder.get_hash()?.to_hex(),
    tx_body: tx_builder.get_body()?.to_hex(),
    metadata,
    payment_address,
    tx_signed: tx_builder.get_assembled_tx()?.to_hex(),
  };
}
