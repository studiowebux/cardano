/**
 * @module
 *
 */

import {
  type NativeScripts,
  Transaction,
  TransactionWitnessSet,
  Vkeywitnesses,
} from "@emurgo/cardano-serialization-lib-nodejs";

import { submit_api } from "../lib/submit.api.ts";
import { hex_to_bytes } from "../util/encode.ts";

export class Submit {
  private cardano_submit_api_base_url: string;

  private transaction: string; // transaction hex
  private signature: string; // client signature

  private policy_vkeys: Vkeywitnesses | undefined; // Policy signatures
  private client_vkeys: Vkeywitnesses | undefined; // client signatures in hex format

  private assembled_tx: Transaction | undefined;

  private hash: string;

  private witnesses: TransactionWitnessSet;
  private native_scripts_vkeys: NativeScripts | undefined;

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
    if (!this.policy_vkeys) {
      throw new Error("Missing policy vkeys.");
    }
    if (!this.client_vkeys) {
      throw new Error("Missing client vkeys.");
    }

    for (let i = 0; i < this.policy_vkeys?.len() || 0; i++) {
      vkeyWitnesses.add(this.policy_vkeys.get(i));
    }

    for (let i = 0; i < this.client_vkeys?.len() || 0; i++) {
      vkeyWitnesses.add(this.client_vkeys.get(i));
    }

    this.witnesses.set_vkeys(vkeyWitnesses);

    if (this.native_scripts_vkeys) {
      this.witnesses.set_native_scripts(this.native_scripts_vkeys);
    }
  }

  assemble_tx(): Submit {
    this.assembled_tx = Transaction.new(
      Transaction.from_hex(this.transaction).body(),
      this.witnesses,
      Transaction.from_hex(this.transaction).auxiliary_data(),
    );

    return this;
  }

  async submit_tx(): Promise<Submit> {
    if (!this.assembled_tx) {
      throw new Error("Missing prepared tx.");
    }
    this.hash = (await submit_api(
      this.cardano_submit_api_base_url,
      this.assembled_tx.to_hex(),
    )) as string;
    return this;
  }

  get_hash(): string {
    return this.hash;
  }

  public static Builder = class {
    private transaction: string = "";
    private signature: string = "";
    private cardano_submit_api_base_url: string = "";

    constructor() {}

    with_transaction(transaction: string) {
      this.transaction = transaction;
      return this;
    }

    with_signature(signature: string) {
      this.signature = signature;
      return this;
    }

    with_cardano_submit_api_base_url(cardano_submit_api_base_url: string) {
      this.cardano_submit_api_base_url = cardano_submit_api_base_url;
      return this;
    }

    build(): Submit {
      return new Submit(
        this.transaction,
        this.signature,
        this.cardano_submit_api_base_url,
      );
    }
  };
}
