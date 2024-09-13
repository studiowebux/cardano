import {
  type Ed25519KeyHash,
  NativeScript,
  NativeScripts,
  ScriptAll,
  ScriptPubkey,
  TimelockExpiry,
} from "@emurgo/cardano-serialization-lib-nodejs";

import { bytes_to_hex } from "../util/encode.ts";

export function create_policy_script(
  policy_key_hash: Ed25519KeyHash,
  ttl: number,
  with_timelock: boolean = true,
): { mint_script: NativeScript; policy_ttl: number } {
  const scripts = NativeScripts.new();
  const key_hash_script = NativeScript.new_script_pubkey(
    ScriptPubkey.new(policy_key_hash),
  );
  scripts.add(key_hash_script);

  const policy_ttl: number = ttl;

  if (with_timelock) {
    const timelock = TimelockExpiry.new(policy_ttl);
    const timelock_script = NativeScript.new_timelock_expiry(timelock);
    scripts.add(timelock_script);
  }

  const mint_script = NativeScript.new_script_all(ScriptAll.new(scripts));

  return { mint_script, policy_ttl };
}

export function get_policy_id(mint_script: NativeScript): string {
  const policy_id = bytes_to_hex(mint_script.hash().to_bytes());
  return policy_id;
}
