import {
  type Ed25519KeyHash,
  NativeScript,
  NativeScripts,
  ScriptAll,
  ScriptPubkey,
  TimelockExpiry,
} from "@emurgo/cardano-serialization-lib-nodejs";

import { bytes_to_hex } from "../util/encode.ts";

/**
 * Creates a new policy script with the given key hash and time-to-live (TTL).
 *
 * This function generates a policy script for minting assets using the provided key hash
 * and TTL. Optionally, it can include a timelock script if `with_timelock` is set to true.
 *
 * @param {Ed25519KeyHash} policy_key_hash - The key hash used for policy key verification.
 * @param {number} ttl - The time-to-live (TTL) in seconds for the minted assets.
 * @param {boolean} [with_timelock=false] - Whether to include a timelock script in the policy.
 * @returns {{ mint_script: NativeScript; policy_ttl: number }} An object containing:
 *    - `mint_script`: The generated policy script as a NativeScript instance.
 *    - `policy_ttl`: The provided time-to-live (TTL) value.
 */
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

/**
 * Calculates the policy ID as a hexadecimal string from a given mint script.
 *
 * This function takes a mint script and returns its corresponding policy ID
 * as a hexadecimal string by hashing the script's bytes and converting them to hex.
 *
 * @param {NativeScript} mint_script - The mint script used for calculating the policy ID.
 * @returns {string} The calculated policy ID as a hexadecimal string.
 */
export function get_policy_id(mint_script: NativeScript): string {
  return bytes_to_hex(mint_script.hash().to_bytes());
}
