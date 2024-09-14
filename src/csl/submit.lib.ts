import {
  type NativeScripts,
  Transaction,
  TransactionWitnessSet,
  Vkeywitnesses,
} from "@emurgo/cardano-serialization-lib-nodejs";

import { ApiError } from "../util/error.ts";
import { submit_api } from "../lib/submit.api.ts";
import { hex_to_bytes } from "../util/encode.ts";

/**
 * Class for submitting Cardano transactions using the `cardano-submit-api`
 * (might add other integration at some point).
 *
 * @export
 * @class Submit
 */
export class Submit {
  /**
   * The base URL of the `cardano-submit-api` instance.
   * @private
   * @type {string}
   */
  private cardano_submit_api_base_url: string;

  /**
   * The transaction hex data.
   * @private
   * @type {string}
   */
  private transaction: string;
  /**
   * The client signature in hex format.
   * @private
   * @type {string}
   */
  private signature: string;

  /**
   * Policy signatures (Vkeywitnesses).
   * @private
   * @type {Vkeywitnesses | undefined}
   */
  private policy_vkeys: Vkeywitnesses | undefined;
  /**
   * Client signatures in hex format.
   * @private
   * @type {Vkeywitnesses | undefined}
   */
  private client_vkeys: Vkeywitnesses | undefined;

  /**
   * The assembled transaction.
   * @private
   * @type {Transaction | undefined}
   */
  private assembled_tx: Transaction | undefined;

  /**
   * The transaction hash after submission.
   * @private
   * @type {string}
   */
  private hash: string;

  /**
   * The witness set containing vkeys and optionally native scripts.
   * @private
   * @type {TransactionWitnessSet}
   */
  private witnesses: TransactionWitnessSet;
  /**
   * Native scripts included in the transaction (if any).
   * @private
   * @type {NativeScripts | undefined}
   */
  private native_scripts_vkeys: NativeScripts | undefined;

  /**
   * Creates an instance of Submit.
   *
   * @param {string} transaction - The transaction hex data.
   * @param {string} signature - The client signature in hex format.
   * @param {string} cardano_submit_api_base_url - The base URL of the `cardano-submit-api` instance.
   */
  constructor(
    transaction: string,
    signature: string,
    cardano_submit_api_base_url: string,
  ) {
    this.transaction = transaction;
    this.signature = signature;
    this.cardano_submit_api_base_url = cardano_submit_api_base_url;
    this.hash = "";

    this.policy_vkeys = Transaction.from_hex(this.transaction)
      .witness_set()
      .vkeys();

    this.native_scripts_vkeys = Transaction.from_hex(this.transaction)
      .witness_set()
      .native_scripts();

    this.client_vkeys = TransactionWitnessSet.from_bytes(
      hex_to_bytes(this.signature),
    ).vkeys();

    this.witnesses = TransactionWitnessSet.new();
    const vkeyWitnesses = Vkeywitnesses.new();
    if (this.policy_vkeys) {
      for (let i = 0; i < this.policy_vkeys?.len() || 0; i++) {
        vkeyWitnesses.add(this.policy_vkeys.get(i));
      }
    }
    if (this.client_vkeys) {
      for (let i = 0; i < this.client_vkeys?.len() || 0; i++) {
        vkeyWitnesses.add(this.client_vkeys.get(i));
      }
    }

    this.witnesses.set_vkeys(vkeyWitnesses);

    if (this.native_scripts_vkeys) {
      this.witnesses.set_native_scripts(this.native_scripts_vkeys);
    }
  }

  /**
   * Assembles the transaction with the prepared witness set.
   *
   * @returns {Submit} - This instance of Submit.
   */
  assemble_tx(): Submit {
    this.assembled_tx = Transaction.new(
      Transaction.from_hex(this.transaction).body(),
      this.witnesses,
      Transaction.from_hex(this.transaction).auxiliary_data(),
    );

    return this;
  }

  /**
   * Submits the assembled transaction using the `cardano-submit-api`.
   *
   * @returns {Promise<Submit>} - This instance of Submit after successful submission.
   */
  async submit_tx(): Promise<Submit> {
    if (!this.assembled_tx) {
      throw new ApiError("Missing prepared tx.", "MISSING_PREPARED_TX", 409);
    }
    this.hash = (await submit_api(
      this.cardano_submit_api_base_url,
      this.assembled_tx.to_hex(),
    )) as string;
    return this;
  }

  /**
   * Retrieves the transaction hash after submission.
   *
   * @returns {string} - The transaction hash.
   */
  get_hash(): string {
    return this.hash;
  }
}

/**
 * Builder class for creating instances of Submit.
 *
 * @export
 * @class SubmitBuilder
 */
export class SubmitBuilder {
  private transaction: string = "";
  private signature: string = "";
  private cardano_submit_api_base_url: string = "";

  /**
   * Creates an instance of Builder.
   */
  constructor() {}

  /**
   * Sets the transaction hex data.
   *
   * @param {string} transaction - The transaction hex data.
   * @returns {SubmitBuilder} - This instance of SubmitBuilder.
   */
  with_transaction(transaction: string): SubmitBuilder {
    this.transaction = transaction;
    return this;
  }

  /**
   * Sets the client signature in hex format.
   *
   * @param {string} signature - The client signature in hex format.
   * @returns {SubmitBuilder} - This instance of SubmitBuilder.
   */
  with_signature(signature: string): SubmitBuilder {
    this.signature = signature;
    return this;
  }

  /**
   * Sets the base URL of the `cardano-submit-api` instance.
   *
   * @param {string} cardano_submit_api_base_url - The base URL of the `cardano-submit-api` instance.
   * @returns {SubmitBuilder} - This instance of SubmitBuilder.
   */
  with_cardano_submit_api_base_url(
    cardano_submit_api_base_url: string,
  ): SubmitBuilder {
    this.cardano_submit_api_base_url = cardano_submit_api_base_url;
    return this;
  }

  /**
   * Builds an instance of Submit.
   *
   * @returns {Submit} - A new instance of Submit.
   */
  build(): Submit {
    return new Submit(
      this.transaction,
      this.signature,
      this.cardano_submit_api_base_url,
    );
  }
}
