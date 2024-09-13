/**
 * @module
 *
 * A utility class for building Cardano transaction bodies, witnesses,
 * and assembling the final transaction.
 */

import {
  Address,
  AssetName,
  BigNum,
  ChangeConfig,
  CoinSelectionStrategyCIP2,
  type Ed25519KeyHash,
  Ed25519KeyHashes,
  hash_transaction,
  Int,
  make_vkey_witness,
  MultiAsset,
  type NativeScript,
  NativeScripts,
  NetworkId,
  type PrivateKey,
  Transaction,
  type TransactionBody,
  TransactionBuilder,
  TransactionHash,
  TransactionInput,
  TransactionMetadatum,
  TransactionOutput,
  TransactionOutputBuilder,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionWitnessSet,
  Value,
  Vkeywitnesses,
} from "@emurgo/cardano-serialization-lib-nodejs";

import { txBuilderCfg } from "../config/tx_builder_config.csl.ts";
import { assets_to_value } from "../lib/assets_to_value.lib.ts";
import type { CIP25Formatted, CIP27Formatted } from "../lib/cips.lib.ts";
import type { Utxo } from "../type/blockfrost.type.ts";
import { encode_to_hex } from "../util/encode.ts";
import { MetadataMap } from "@emurgo/cardano-serialization-lib-nodejs";
import { MetadataList } from "@emurgo/cardano-serialization-lib-nodejs";

/**
 * The `TxBuilder` class is responsible for constructing a Cardano transaction
 * body with inputs, outputs, metadata, and witness scripts. It also handles
 * transaction signing and assembly.
 */
export class TxBuilder {
  private tx_builder: TransactionBuilder;
  /**
   * Besh32 string
   */
  private receiver_address: string;
  private receiver_key_hash: Ed25519KeyHash | undefined;
  private receiver_address_as_address: Address | undefined;

  /**
   * Besh32 string
   */
  private main_receiver_address: string;
  private main_receiver_address_as_address: Address | undefined;

  private parsed_utxos: TransactionUnspentOutputs;

  private utxos: Utxo[];
  private nft_cost_in_lovelace: string;

  private body: TransactionBody | undefined;
  private hash: TransactionHash | undefined;

  private witnesses: TransactionWitnessSet;
  private unsigned_tx: Transaction | undefined; // raw tx to be signed
  private assembled_tx: Transaction | undefined; // full tx (with metadata)
  private tx_to_sign: Transaction | undefined; // tx with potentially removed metadata

  private hide_metadata: boolean;

  constructor(
    receiver_address: string,
    main_receiver_address: string,
    utxos: Utxo[],
    nft_cost_in_lovelace: string,
    hide_metadata: boolean,
  ) {
    this.tx_builder = TransactionBuilder.new(txBuilderCfg);
    this.receiver_address = receiver_address;
    this.main_receiver_address = main_receiver_address;

    if (this.receiver_address) {
      this.receiver_key_hash = Address.from_bech32(this.receiver_address)
        .payment_cred()
        ?.to_keyhash();

      this.receiver_address_as_address = Address.from_bech32(
        this.receiver_address,
      );
    }

    if (this.main_receiver_address) {
      this.main_receiver_address_as_address = Address.from_bech32(
        main_receiver_address,
      );
    }

    this.utxos = utxos;
    this.nft_cost_in_lovelace = nft_cost_in_lovelace;

    this.witnesses = TransactionWitnessSet.new();
    this.parsed_utxos = TransactionUnspentOutputs.new();

    this.hide_metadata = hide_metadata;
  }

  get_utxos(): Utxo[] {
    return this.utxos;
  }

  get_receiver_key_hash(): Ed25519KeyHash | undefined {
    return this.receiver_key_hash;
  }

  get_parsed_utxos(): TransactionUnspentOutputs | undefined {
    return this.parsed_utxos;
  }

  get_body(): TransactionBody | undefined {
    return this.body;
  }

  get_hash(): TransactionHash | undefined {
    return this.hash;
  }

  get_unsigned_tx(): Transaction | undefined {
    return this.unsigned_tx;
  }

  get_assembled_tx(): Transaction | undefined {
    return this.assembled_tx;
  }

  get_tx_to_sign(): Transaction | undefined {
    return this.tx_to_sign;
  }

  get_json(): string | undefined {
    return this.assembled_tx?.to_json();
  }

  get_size(): number {
    return this.tx_builder.full_size();
  }

  get_inputs(): string {
    return this.tx_builder.get_total_input().to_json();
  }

  get_outputs(): string {
    return this.tx_builder.get_total_output().to_json();
  }

  get_mint(): string | undefined {
    return this.tx_builder.get_mint_builder()?.build().to_json();
  }

  get_metadata(): string | undefined {
    return this.tx_builder.get_auxiliary_data()?.metadata()?.to_json();
  }

  parse_utxos(): TxBuilder {
    if (!this.receiver_address_as_address) {
      throw new Error("Missing receiver address.");
    }
    this.utxos.forEach((utxo: Utxo) => {
      const multi_assets = MultiAsset.new();
      const { tx_hash, output_index, amount } = utxo;

      if (Number(amount[0].quantity) > Number(this.nft_cost_in_lovelace)) {
        this.parsed_utxos.add(
          TransactionUnspentOutput.new(
            TransactionInput.new(
              TransactionHash.from_hex(tx_hash),
              output_index,
            ),
            TransactionOutput.new(
              this.receiver_address_as_address!,
              assets_to_value(multi_assets, amount),
            ),
          ),
        );
      }
    });

    return this;
  }

  add_mint_or_burn_asset(
    mint_script: NativeScript,
    asset_name: string,
    quantity: number,
  ): TxBuilder {
    if (!this.receiver_address_as_address) {
      throw new Error("Missing receiver address.");
    }
    if (quantity < 0) {
      this.tx_builder.add_mint_asset(
        mint_script,
        AssetName.new(encode_to_hex(asset_name)), // cip-25 v2
        Int.new_i32(quantity),
      );
    } else {
      this.tx_builder.add_mint_asset_and_output_min_required_coin(
        mint_script,
        AssetName.new(encode_to_hex(asset_name)), // cip-25 v2
        Int.new_i32(quantity),
        TransactionOutputBuilder.new()
          .with_address(this.receiver_address_as_address)
          .next(),
      );
    }

    return this;
  }

  add_mint_or_burn_assets(
    assets: {
      mint_script: NativeScript;
      asset_name: string;
      quantity: number;
    }[],
  ): TxBuilder {
    if (!this.receiver_address_as_address) {
      throw new Error("Missing receiver address.");
    }
    for (const asset of assets) {
      this.add_mint_or_burn_asset(
        asset.mint_script,
        asset.asset_name,
        asset.quantity,
      );
    }

    return this;
  }

  add_output(
    override_main_receiver_address: Address | undefined = undefined,
    override_value: string | undefined = undefined,
  ): TxBuilder {
    if (!override_value && !this.main_receiver_address_as_address) {
      throw new Error("Missing main receiver address.");
    }
    this.tx_builder.add_output(
      TransactionOutput.new(
        override_main_receiver_address ||
          this.main_receiver_address_as_address!,
        Value.new(BigNum.from_str(override_value || this.nft_cost_in_lovelace)),
      ),
    );

    return this;
  }

  set_ttl(tx_ttl: string): TxBuilder {
    this.tx_builder.set_ttl_bignum(BigNum.from_str(tx_ttl));
    return this;
  }

  // CIP-25
  add_json_metadata(metadata: CIP25Formatted): TxBuilder {
    if (metadata[721].length > 1) {
      this.tx_builder.add_json_metadatum(
        BigNum.from_str("721"),
        JSON.stringify(metadata[721]),
      );
    } else {
      this.tx_builder.add_json_metadatum(
        BigNum.from_str("721"),
        JSON.stringify(metadata[721][0]),
      );
    }

    return this;
  }

  // CIP-27
  add_royalties(metadata: CIP27Formatted): TxBuilder {
    this.tx_builder.add_json_metadatum(
      BigNum.from_str("777"),
      JSON.stringify(metadata["777"]),
    );

    return this;
  }

  // CIP-25
  add_json_metadatas(metadatas: CIP25Formatted[]): TxBuilder {
    this.tx_builder.add_json_metadatum(
      BigNum.from_str("721"),
      JSON.stringify(
        metadatas.map((metadata) => Object.values(metadata).flat()).flat(),
      ),
    );

    return this;
  }

  // CIP-20
  add_tx_metadata(messages: string[]): TxBuilder {
    const list = MetadataList.new();
    const map = MetadataMap.new();
    messages.forEach((message) =>
      list.add(TransactionMetadatum.new_text(message)),
    );
    map.insert(
      TransactionMetadatum.new_text("msg"),
      TransactionMetadatum.new_list(list),
    );
    this.tx_builder.add_metadatum(
      BigNum.from_str("674"),
      TransactionMetadatum.new_map(map),
    );

    return this;
  }

  /**
   * Must be the last function to call before witnesses
   */
  add_inputs(): TxBuilder {
    if (!this.parsed_utxos) {
      throw new Error("Missing parsed Utxos.");
    }
    if (!this.receiver_address_as_address) {
      throw new Error("Missing receiver address.");
    }
    this.tx_builder.add_inputs_from_and_change(
      this.parsed_utxos,
      CoinSelectionStrategyCIP2.LargestFirstMultiAsset,
      ChangeConfig.new(this.receiver_address_as_address),
    );

    return this;
  }

  build_body_and_hash(): TxBuilder {
    this.body = this.tx_builder.build();
    this.hash = hash_transaction(this.body);

    return this;
  }

  policy_witness(
    mint_scripts: NativeScript[],
    policy_skeys: PrivateKey[],
  ): TxBuilder {
    if (!this.hash) {
      throw new Error("Missing transaction hash.");
    }
    const vkeyWitnesses = Vkeywitnesses.new();
    for (const policy_skey of policy_skeys) {
      vkeyWitnesses.add(make_vkey_witness(this.hash, policy_skey));
    }
    this.witnesses.set_vkeys(vkeyWitnesses);
    const witness_scripts = NativeScripts.new();
    for (const mint_script of mint_scripts) {
      witness_scripts.add(mint_script);
    }
    this.witnesses.set_native_scripts(witness_scripts);

    return this;
  }

  add_signers(): TxBuilder {
    if (!this.receiver_key_hash) {
      throw new Error("Missing receiver key hash.");
    }
    if (!this.body) {
      throw new Error("Missing transaction body.");
    }
    const required_signers = Ed25519KeyHashes.new();
    required_signers.add(this.receiver_key_hash);
    this.body.set_required_signers(required_signers);

    return this;
  }

  set_network_id(id: NetworkId = NetworkId.testnet()): TxBuilder {
    if (!this.body) {
      throw new Error("Missing transaction body.");
    }
    this.body.set_network_id(id);
    return this;
  }

  build_tx(): TxBuilder {
    this.unsigned_tx = this.tx_builder.build_tx();
    return this;
  }

  assemble_tx(): TxBuilder {
    if (!this.unsigned_tx) {
      throw new Error("Missing unsigned transaction.");
    }
    this.assembled_tx = Transaction.new(
      this.unsigned_tx.body(),
      this.witnesses,
      this.unsigned_tx.auxiliary_data(),
    );

    return this;
  }

  remove_metadata(): TxBuilder {
    if (!this.unsigned_tx) {
      throw new Error("Missing unsigned transaction.");
    }
    this.tx_to_sign = Transaction.new(
      this.unsigned_tx.body(),
      this.witnesses,
      this.hide_metadata ? undefined : this.unsigned_tx.auxiliary_data(),
    );
    return this;
  }

  // CIP-86
  // FIXME: will be overriden if already exists.
  assign_metadata_oracle(
    policy_id: string,
    main_address: string,
    update_address: string,
  ): TxBuilder {
    this.tx_builder.add_json_metadatum(
      BigNum.from_str("86"),
      JSON.stringify({
        assign_metadata_oracle: {
          [policy_id]: {
            main_address,
            update_address,
          },
        },
      }),
    );

    return this;
  }

  // CIP-86
  // FIXME: will be overriden if already exists.
  simple_metadata_update(
    policy_id: string,
    asset_name: string,
    metadata: Record<string, unknown>,
    version: 1 | 2 = 2,
  ): TxBuilder {
    this.tx_builder.add_json_metadatum(
      BigNum.from_str("86"),
      JSON.stringify({
        version,
        simple_metadata_update: {
          [policy_id]: {
            [asset_name]: {
              ...metadata,
            },
          },
        },
      }),
    );

    return this;
  }

  public static Builder = class {
    private receiver_address: string = "";
    private main_receiver_address: string = "";
    private utxos: Utxo[] = [];
    private nft_cost_in_lovelace: string = "0";
    private hide_metadata: boolean = false;

    constructor() {}

    with_receiver_address(receiver_address: string) {
      this.receiver_address = receiver_address;
      return this;
    }

    with_main_receiver_address(main_receiver_address: string) {
      this.main_receiver_address = main_receiver_address;
      return this;
    }

    with_utxos(utxos: Utxo[]) {
      this.utxos = utxos;
      return this;
    }

    with_nft_cost_in_lovelace(nft_cost_in_lovelace: string) {
      this.nft_cost_in_lovelace = nft_cost_in_lovelace;
      return this;
    }

    with_hide_metadata(hide_metadata: boolean) {
      this.hide_metadata = hide_metadata;
      return this;
    }

    build(): TxBuilder {
      return new TxBuilder(
        this.receiver_address,
        this.main_receiver_address,
        this.utxos,
        this.nft_cost_in_lovelace,
        this.hide_metadata,
      );
    }
  };
}
