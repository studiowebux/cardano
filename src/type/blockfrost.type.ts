export type Tip = {
  time: number;
  height: number;
  hash: string;
  slot: number;
  epoch: number;
  epoch_slot: number;
  slot_leader: string;
  size: number;
  tx_count: number;
  output: string;
  fees: string;
  block_vrf: string;
  op_cert: string;
  op_cert_counter: string;
  previous_block: string;
  next_block: string;
  confirmations: number;
};

export type Utxo = {
  address: string;
  tx_hash: string;
  output_index: number;
  amount: Asset[];
  block?: string;
  data_hash?: string | null;
  inline_datum?: string | null;
  reference_script_hash?: string | null;
};

export type Asset = {
  unit: string;
  quantity: string;
};
