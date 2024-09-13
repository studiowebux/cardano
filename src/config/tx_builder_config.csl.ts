// @ts-types="@emurgo/cardano-serialization-lib-nodejs/cardano_serialization_lib.d.ts"
import {
  BigNum,
  LinearFee,
  TransactionBuilderConfigBuilder,
} from "@emurgo/cardano-serialization-lib-nodejs";

export const linearFee = LinearFee.new(
  BigNum.from_str("44"),
  BigNum.from_str("155381"),
);

export const txBuilderCfg = TransactionBuilderConfigBuilder.new()
  .fee_algo(linearFee)
  .pool_deposit(BigNum.from_str("500000000"))
  .key_deposit(BigNum.from_str("2000000"))
  .max_value_size(5000)
  .max_tx_size(16384)
  .coins_per_utxo_byte(BigNum.from_str("4310"))
  .build();
