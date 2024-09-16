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
  MetadataList,
  MetadataMap,
} from "@emurgo/cardano-serialization-lib-nodejs";

import { txBuilderCfg } from "../config/tx_builder_config.csl.ts";
import { assets_to_value } from "./assets_to_value.lib.ts";
import type { CIP25Formatted, CIP27Formatted } from "../lib/cips.lib.ts";
import type { Utxo } from "../type/blockfrost.type.ts";
import { string_to_bytes } from "../util/encode.ts";
import { ApiError } from "../util/error.ts";

/**
 * The `Tx` class is responsible for constructing a Cardano transaction
 * body with inputs, outputs, metadata, and witness scripts. It also handles
 * transaction signing and assembly.
 */
export class Tx {
  private tx_builder: TransactionBuilder;
  /**
   * Besh32 string
   */
  private sender_address: string;
  private sender_key_hash: Ed25519KeyHash | undefined;
  private sender_address_as_address: Address | undefined;

  /**
   * Besh32 string
   */
  private receiver_address: string;
  private receiver_address_as_address: Address | undefined;

  private parsed_utxos: TransactionUnspentOutputs;

  private utxos: Utxo[];
  private nft_cost_in_lovelace: number | undefined = undefined;
  private ada_to_send: number | undefined = undefined;

  private body: TransactionBody | undefined;
  private hash: TransactionHash | undefined;

  private witnesses: TransactionWitnessSet;
  private unsigned_tx: Transaction | undefined; // raw tx to be signed
  private assembled_tx: Transaction | undefined; // full tx (with metadata)
  private tx_to_sign: Transaction | undefined; // tx with potentially removed metadata

  private hide_metadata: boolean;

  /**
   * Create a new instance of TxBuilder with optional parameters.
   *
   * @param senderAddress - The address of the transaction sender.
   * @param receiverAddress - The address of the transaction receiver.
   * @param utxos - An array of UTXOs (unspent transaction outputs) to be used in the transaction.
   * @param nftCostInLovelace - The cost of NFT transactions in lovelaces. Defaults to undefined.
   * @param adaToSend - The amount of ADA to send in lovelaces. Defaults to undefined.
   * @param hideMetadata - A boolean indicating whether to hide metadata in the transaction. Defaults to false.
   */
  constructor(
    sender_address: string,
    receiver_address: string,
    utxos: Utxo[],
    nft_cost_in_lovelace: number | undefined,
    ada_to_send: number | undefined,
    hide_metadata: boolean,
  ) {
    this.tx_builder = TransactionBuilder.new(txBuilderCfg);
    this.sender_address = sender_address;
    this.receiver_address = receiver_address;

    if (this.sender_address) {
      this.sender_key_hash = Address.from_bech32(this.sender_address)
        .payment_cred()
        ?.to_keyhash();

      this.sender_address_as_address = Address.from_bech32(this.sender_address);
    }

    if (this.receiver_address) {
      this.receiver_address_as_address = Address.from_bech32(
        this.receiver_address,
      );
    }

    this.utxos = utxos;
    this.nft_cost_in_lovelace = nft_cost_in_lovelace;
    this.ada_to_send = ada_to_send;

    this.witnesses = TransactionWitnessSet.new();
    this.parsed_utxos = TransactionUnspentOutputs.new();

    this.hide_metadata = hide_metadata;
  }

  get_utxos(): Utxo[] {
    return this.utxos;
  }

  get_sender_key_hash(): Ed25519KeyHash | undefined {
    return this.sender_key_hash;
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

  /**
   * Parse and filter UTxOs based on the sender's address and required Ada or NFT cost.
   *
   * This method iterates through the provided UTxOs, filters them based on the required Ada (or NFT cost), and adds
   * valid ones to the `parsed_utxos` collection. It ensures that the sender's address is present; otherwise, it throws
   * an error.
   *
   * @returns {this} - A reference to the current instance for method chaining.
   *
   * @throws {ApiError} Throws an error if the sender's address is missing.
   */
  parse_utxos(): Tx {
    const address = this.sender_address_as_address;
    if (!address) {
      throw new ApiError(
        "Missing sender addresses.",
        "MISSING_SENDER_ADDRESS",
        409,
      );
    }

    this.utxos.forEach((utxo: Utxo) => {
      const multi_assets = MultiAsset.new();
      const { tx_hash, output_index, amount } = utxo;

      if (
        Number(amount[0].quantity) >
        Number(this.nft_cost_in_lovelace ?? this.ada_to_send ?? 0)
      ) {
        this.parsed_utxos.add(
          TransactionUnspentOutput.new(
            TransactionInput.new(
              TransactionHash.from_hex(tx_hash),
              output_index,
            ),
            TransactionOutput.new(
              address,
              assets_to_value(multi_assets, amount),
            ),
          ),
        );
      }
    });

    return this;
  }

  /**
   * Add a single mint or burn asset operation to the transaction builder with optional output.
   *
   * This method checks if the provided quantity is negative. If it is, a mint operation is created; otherwise, both
   * mint and output operations are created for burning assets. The sender's address is required; otherwise, an error
   * will be thrown.
   *
   * @param {NativeScript} mint_script - The native script used for asset minting or burning.
   * @param {string} asset_name - The name of the asset being minted or burned.
   * @param {number} quantity - The quantity of assets to mint or burn. Negative values indicate a burn operation,
   * while positive values indicate a mint (i.e., output) operation.
   *
   * @returns {this} - A reference to the current instance for method chaining.
   *
   * @throws {ApiError} Throws an error if the sender's address is missing.
   */
  add_mint_or_burn_asset(
    mint_script: NativeScript,
    asset_name: string,
    quantity: number,
  ): Tx {
    const address = this.sender_address_as_address;
    if (!address) {
      throw new ApiError(
        "Missing sender addresses.",
        "MISSING_SENDER_ADDRESS",
        409,
      );
    }
    if (quantity < 0) {
      // Burn
      this.tx_builder.add_mint_asset(
        mint_script,
        AssetName.new(string_to_bytes(asset_name)), // cip-25 v2
        Int.new_i32(quantity),
      );
    } else {
      // Mint
      this.tx_builder.add_mint_asset_and_output_min_required_coin(
        mint_script,
        AssetName.new(string_to_bytes(asset_name)), // cip-25 v2
        Int.new_i32(quantity),
        TransactionOutputBuilder.new().with_address(address).next(),
      );
    }

    return this;
  }

  /**
   * Add multiple mint or burn assets operations to the transaction builder.
   *
   * This method iterates through the provided array of assets, calling `add_mint_or_burn_asset` for each asset with
   * its respective script, name, and quantity. It supports both minting and burning operations based on the given
   * parameters.
   *
   * @param {{
   *   mint_script: NativeScript;
   *   asset_name: string;
   *   quantity: number;
   * }[]} assets - An array of objects containing mint script, asset name, and quantity for each asset operation.
   *
   * @returns {this} - A reference to the current instance for method chaining.
   */
  add_mint_or_burn_assets(
    assets: {
      mint_script: NativeScript;
      asset_name: string;
      quantity: number;
    }[],
  ): Tx {
    for (const asset of assets) {
      this.add_mint_or_burn_asset(
        asset.mint_script,
        asset.asset_name,
        asset.quantity,
      );
    }

    return this;
  }

  /**
   * Add an output to the transaction builder with optional overrides for receiver address and lovelace value.
   *
   * This method constructs a new `TransactionOutput` using either provided override values or internal instance data
   * (e.g., `receiver_address_as_address`, `nft_cost_in_lovelace`, or `ada_to_send`). If neither override nor internal
   * data is present, an error will be thrown.
   *
   * @param {Address | undefined} [override_receiver_address] - The optional receiver address override.
   * @param {string | undefined} [override_value] - The optional value ( Lovelace or Ada) override as a string.
   *
   * @returns {this} - A reference to the current instance for method chaining.
   *
   * @throws {ApiError} Throws an error if neither the receiver address nor the value is provided or available.
   */
  add_output(
    override_receiver_address: Address | undefined = undefined,
    override_value: string | undefined = undefined,
  ): Tx {
    if (!override_value && !this.receiver_address_as_address) {
      throw new ApiError(
        "Missing receiver address.",
        "MISSING_RECEIVER_ADDRESS",
        409,
      );
    }
    this.tx_builder.add_output(
      TransactionOutput.new(
        override_receiver_address ?? this.receiver_address_as_address!,
        Value.new(
          BigNum.from_str(
            Number(
              override_value ?? this.nft_cost_in_lovelace ?? this.ada_to_send,
            ).toString(),
          ),
        ),
      ),
    );

    return this;
  }

  /**
   * Set the transaction time-to-live (TTL) with a given number value.
   *
   * This method converts the provided TTL number to a BigNumber and sets it as the TTL for the current transaction
   * builder instance.
   *
   * @param {number} tx_ttl - The desired TTL value as a number, e.g., 145.
   *
   * @returns {this} - A reference to the current instance for method chaining.
   */

  set_ttl(tx_ttl: number): Tx {
    this.tx_builder.set_ttl_bignum(BigNum.from_str(Number(tx_ttl).toString()));
    return this;
  }

  /**
   * Add CIP-25 formatted metadata to the transaction builder.
   *
   * This method handles both single and array data for index 721, adding the appropriate JSON metadatum at that
   * index in the transaction builder.
   *
   * @param {CIP25Formatted} metadata - A CIP-25 formatted metadata object containing data for index 721.
   *
   * @returns {this} - A reference to the current instance for method chaining.
   */
  add_json_metadata(metadata: CIP25Formatted): Tx {
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

  /**
   * Add CIP-27 royalty metadata to the transaction builder.
   *
   * This method adds the provided CIP-27 formatted metadata as a JSON metadatum at index 777 in the transaction builder.
   *
   * @param {CIP27Formatted} metadata - A CIP-27 formatted metadata object containing data for index 777.
   *
   * @returns {this} - A reference to the current instance for method chaining.
   */
  add_royalties(metadata: CIP27Formatted): Tx {
    this.tx_builder.add_json_metadatum(
      BigNum.from_str("777"),
      JSON.stringify(metadata["777"]),
    );

    return this;
  }

  /**
   * Add CIP-25 formatted metadata(s) to the transaction builder.
   *
   * This method converts the provided metadata objects into a single JSON string and adds it as a metadatum at index
   * 721 in the transaction builder.
   *
   * @param {CIP25Formatted[]} metadatas - An array of CIP-25 formatted metadata objects.
   *
   * @returns {this} - A reference to the current instance for method chaining.
   */
  add_json_metadatas(metadatas: CIP25Formatted[]): Tx {
    this.tx_builder.add_json_metadatum(
      BigNum.from_str("721"),
      JSON.stringify(
        metadatas.map((metadata) => Object.values(metadata).flat()).flat(),
      ),
    );

    return this;
  }

  /**
   * Add CIP-20 metadata to the transaction builder with provided messages.
   *
   * This method appends the given messages as metadatum text items under the key "msg" in a metadata map. The map is
   * then added to the transaction builder as a metadatum at index 674.
   *
   * @param {string[]} messages - An array of strings (messages max 64 chars per item) to add as CIP-20 metadata.
   *
   * @returns {Tx} - The instance with updated metadata in the transaction builder.
   */
  add_tx_metadata(messages: string[]): Tx {
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
   * Add inputs to the transaction builder with the parsed Utxos and create change output.
   *
   * This method throws errors if either `parsed_utxos` or `sender_address_as_address` is missing. It then adds the
   * provided Utxos as inputs to the transaction builder, creating a change output at the sender's address using the
   * LargestFirstMultiAsset coin selection strategy.
   *
   * Must be the last function to call before witnesses (outputs and mints/burns must be set)
   *
   * @returns {this} - A reference to the current instance for method chaining.
   *
   * @throws {ApiError} - Throws an error if either parsed Utxos or sender address is missing.
   */
  add_inputs(): Tx {
    if (!this.parsed_utxos) {
      throw new ApiError("Missing parsed Utxos.", "MISSING_PARSED_UTXOS", 409);
    }

    const address = this.sender_address_as_address;
    if (!address) {
      throw new ApiError(
        "Missing sender addresses.",
        "MISSING_SENDER_ADDRESS",
        409,
      );
    }
    this.tx_builder.add_inputs_from_and_change(
      this.parsed_utxos,
      CoinSelectionStrategyCIP2.LargestFirstMultiAsset,
      ChangeConfig.new(address),
    );

    return this;
  }

  /**
   * Build the transaction body and calculate its hash.
   *
   * This method constructs the `transaction_body` using the current state of the transaction builder, and then computes
   * the hash of that body. The results are stored in `this.body` and `this.hash`, respectively.
   *
   * @returns {Tx} - The instance with updated `body` and `hash` properties.
   */
  build_body_and_hash(): Tx {
    this.body = this.tx_builder.build();
    this.hash = hash_transaction(this.body);

    return this;
  }

  /**
   * Add policy witnesses to the transaction with provided mint scripts and private keys.
   *
   * This method throws an error if no `transaction_hash` is available. It then creates and adds the necessary vkey
   * witnesses along with mint scripts as witnesses to the transaction.
   *
   * @param {NativeScript[]} mint_scripts - The list of NativeScripts (minting policies) to add as witnesses.
   * @param {PrivateKey[]} policy_skeys - The list of private keys corresponding to the policy keys used in `mint_scripts`.
   *
   * @returns {this} - A reference to the current instance for method chaining.
   *
   * @throws {ApiError} - Throws an error if there's no transaction hash available.
   */
  policy_witness(mint_scripts: NativeScript[], policy_skeys: PrivateKey[]): Tx {
    if (!this.hash) {
      throw new ApiError("Missing transaction hash.", "MISSING_TX_HASH", 409);
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

  /**
   * Set the required signers for the transaction body with the sender's key hash.
   *
   * This method throws errors if either the `sender_key_hash` or the `transaction_body` is missing. It then adds
   * the sender's key hash as a required signer to the transaction body.
   *
   * @returns {this} - A reference to the current instance for method chaining.
   *
   * @throws {ApiError} - Throws an error if either the sender key hash or the transaction body is missing.
   */
  add_signers(): Tx {
    if (!this.sender_key_hash) {
      throw new ApiError(
        "Missing sender key hash.",
        "MISSING_SENDER_KEYHASH",
        409,
      );
    }
    if (!this.body) {
      throw new ApiError("Missing transaction body.", "MISSING_TX_BODY", 409);
    }
    const required_signers = Ed25519KeyHashes.new();
    required_signers.add(this.sender_key_hash);
    this.body.set_required_signers(required_signers);

    return this;
  }

  /**
   * Set the network ID for the transaction body.
   *
   * If no `transaction_body` is provided, an error will be thrown. The method then sets the specified `network_id`.
   *
   * @param {NetworkId | string} [id=NetworkId.testnet()] - The desired network ID to set (default: Testnet).
   *
   * @returns {this} - A reference to the current instance for method chaining.
   *
   * @throws {ApiError} - Throws an error if there's no transaction body available.
   */
  set_network_id(id: NetworkId = NetworkId.testnet()): Tx {
    if (!this.body) {
      throw new ApiError("Missing transaction body.", "MISSING_TX_BODY", 409);
    }
    this.body.set_network_id(id);
    return this;
  }

  /**
   * Build the unsigned transaction using the current state of the transaction builder.
   *
   * This method populates `this.unsigned_tx` with the built transaction object, ready to be signed or assembled for signing.
   *
   * @returns {Tx} - The unsigned transaction object.
   */
  build_tx(): Tx {
    this.unsigned_tx = this.tx_builder.build_tx();
    return this;
  }

  /**
   * Assemble the unsigned transaction with witnesses and auxiliary data for signing.
   *
   * This method throws an `ApiError` if there is no unsigned transaction available. It creates a new transaction object
   * using the body of the unsigned transaction, the provided witnesses, and the auxiliary data (if present).
   *
   * @returns {Tx} - A new assembled transaction object ready to be signed.
   *
   * @throws {ApiError} - Throws an error if there's no unsigned transaction available.
   */
  assemble_tx(): Tx {
    if (!this.unsigned_tx) {
      throw new ApiError(
        "Missing unsigned transaction.",
        "MISSING_UNSIGNED_TX",
        409,
      );
    }
    this.assembled_tx = Transaction.new(
      this.unsigned_tx.body(),
      this.witnesses,
      this.unsigned_tx.auxiliary_data(),
    );

    return this;
  }

  /**
   * Remove metadata from the unsigned transaction and prepare it for signing.
   *
   * This method throws an `ApiError` if there is no unsigned transaction available. It removes the auxiliary data
   * containing metadata (if present) before creating a new transaction object ready to be signed. If `hide_metadata`
   * option is set to `false`, the original auxiliary data will be retained.
   *
   * @returns {Tx} - A new transaction object without metadata, if `hide_metadata` is true, ready to be signed.
   *
   * @throws {ApiError} - Throws an error if there's no unsigned transaction available.
   */
  remove_metadata(): Tx {
    if (!this.unsigned_tx) {
      throw new ApiError(
        "Missing unsigned transaction.",
        "MISSING_UNSIGNED_TX",
        409,
      );
    }
    this.tx_to_sign = Transaction.new(
      this.unsigned_tx.body(),
      this.witnesses,
      this.hide_metadata ? undefined : this.unsigned_tx.auxiliary_data(),
    );
    return this;
  }

  /**
   * CIP-86 Implementation to assign a metadata oracle for a given policy ID.
   *
   * This function sets the `main_address` and `update_address` for the specified policy. If an oracle already exists
   * for the provided policy, it will be overridden.
   *
   * @param {string} policy_id - The policy ID for which to assign the metadata oracle.
   * @param {string} main_address - The address for updating the main address.
   * @param {string} update_address - The address responsible to update metadata.
   *
   * @returns {this} - A reference to the current instance of the builder for method chaining.
   */
  assign_metadata_oracle(
    policy_id: string,
    main_address: string,
    update_address: string,
  ): Tx {
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

  /**
   * CIP-86 Implementation to update one asset by name.
   *
   * You can set the `version` parameter to indicate whether decoding is required (`1`) or not (`2`, default).
   *
   * This function will override existing metadata if the asset already exists.
   *
   * @param {string} policy_id - The policy ID for the asset.
   * @param {string} asset_name - The name of the asset to update.
   * @param {Record<string, unknown>} metadata - The new metadata for the asset.
   * @param {1 | 2} [version=2] - The version number. Default is `2`.
   *
   * @returns {Tx} - A transaction object ready to be signed and sent.
   */
  simple_metadata_update(
    policy_id: string,
    asset_name: string,
    metadata: Record<string, unknown>,
    version: 1 | 2 = 2,
  ): Tx {
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
}

/**
 * Class used to build a new transaction ({@link Tx}) with specific parameters.
 */
export class TxBuilder {
  private sender_address: string = "";
  private receiver_address: string = "";
  private utxos: Utxo[] = [];
  private nft_cost_in_lovelace: number | undefined = undefined;
  private ada_to_send: number | undefined = undefined;
  private hide_metadata: boolean = false;

  /**
   * Creates an instance of TxBuilder.
   */
  constructor() {}

  /**
   * Sets the sender's address for the transaction being built.
   * @param {string} sender_address - The sender's address.
   * @returns {TxBuilder}
   */
  with_sender_address(sender_address: string): TxBuilder {
    this.sender_address = sender_address;
    return this;
  }

  /**
   * Sets the receiver's address for the transaction being built.
   * @param {string} receiver_address - The receiver's address.
   * @returns {TxBuilder}
   */
  with_receiver_address(receiver_address: string): TxBuilder {
    this.receiver_address = receiver_address;
    return this;
  }

  /**
   * Sets an array of UTxOs for the transaction being built.
   * @param {Utxo[]} utxos - An array of unspent transaction outputs (UTxOs).
   * @returns {TxBuilder}
   */
  with_utxos(utxos: Utxo[]): TxBuilder {
    this.utxos = utxos;
    return this;
  }

  /**
   * Sets the cost in lovelace for NFT transactions.
   * @param {number} nft_cost_in_lovelace - The cost in lovelace.
   * @returns {TxBuilder}
   */
  with_nft_cost_in_lovelace(nft_cost_in_lovelace: number): TxBuilder {
    this.nft_cost_in_lovelace = nft_cost_in_lovelace;
    return this;
  }

  /**
   * Sets the amount of ADA to send in the transaction being built.
   * @param {number} ada_to_send - The amount of ADA.
   * @returns {TxBuilder}
   */
  with_ada_to_send(ada_to_send: number): TxBuilder {
    this.ada_to_send = ada_to_send;
    return this;
  }

  /**
   * Sets whether to hide metadata in the assembled transaction.
   * @param {boolean} [hide_metadata=false] - Whether to hide metadata. Defaults to false if not provided.
   * @returns {TxBuilder}
   */
  with_hide_metadata(hide_metadata: boolean): TxBuilder {
    this.hide_metadata = hide_metadata;
    return this;
  }

  /**
   * Builds and returns a new {@link Tx} instance with the specified parameters.
   * @returns {Tx}
   */
  build(): Tx {
    return new Tx(
      this.sender_address,
      this.receiver_address,
      this.utxos,
      this.nft_cost_in_lovelace,
      this.ada_to_send,
      this.hide_metadata,
    );
  }
}
