import {
  BigNum,
  LinearFee,
  TransactionBuilderConfigBuilder,
  type TransactionBuilderConfig,
} from "@emurgo/cardano-serialization-lib-nodejs";

/**
 * Linear Fee instance
 *
 * @type {LinearFee}
 */
export const linearFee: LinearFee = LinearFee.new(
  BigNum.from_str("44"),
  BigNum.from_str("155381"),
);

/**
 * A TransactionBuilderConfig instance with configured fee algorithm,
 * deposit values, size limits, and coin per UTXO byte.
 *
 * @type {TransactionBuilderConfig}
 */
export const txBuilderCfg: TransactionBuilderConfig =
  TransactionBuilderConfigBuilder.new()
    .fee_algo(linearFee)
    .pool_deposit(BigNum.from_str("500000000"))
    .key_deposit(BigNum.from_str("2000000"))
    .max_value_size(5000)
    .max_tx_size(16384)
    .coins_per_utxo_byte(BigNum.from_str("4310"))
    .build();
