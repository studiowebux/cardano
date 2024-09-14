import {
  EnterpriseAddress,
  PrivateKey,
  Credential,
  NetworkInfo,
  Address,
  type Ed25519KeyHash,
} from "@emurgo/cardano-serialization-lib-nodejs";

/**
 * Creates a new Cardano wallet with Ed25519 key pair and generates addresses for different networks.
 *
 * @param {boolean} [save_locally=false] - If set to true, the wallet information will be saved locally as a JSON file with a timestamp.
 * @returns {{ skey: string; skey_hex: string; pkey: string; pkey_hex: string; key_hash: string; address_preview: string; address_preprod: string; address_mainnet: string }}
 */
export function create_wallet(save_locally: boolean = false): {
  skey: string;
  skey_hex: string;
  pkey: string;
  pkey_hex: string;
  key_hash: string;
  address_preview: string;
  address_preprod: string;
  address_mainnet: string;
} {
  const privateKey = PrivateKey.generate_ed25519();
  // Derive the public key
  const publicKey = privateKey.to_public();
  // Create a key hash
  const keyHash = publicKey.hash();

  // Create an enterprise address for each networks. (mainnet and testnets)
  const enterpriseAddressPreview = EnterpriseAddress.new(
    NetworkInfo.testnet_preview().network_id(),
    Credential.from_keyhash(keyHash),
  );
  const enterpriseAddressPreprod = EnterpriseAddress.new(
    NetworkInfo.testnet_preprod().network_id(),
    Credential.from_keyhash(keyHash),
  );
  const enterpriseAddressMainnet = EnterpriseAddress.new(
    NetworkInfo.mainnet().network_id(),
    Credential.from_keyhash(keyHash),
  );
  const wallet = {
    skey: privateKey.to_bech32(),
    skey_hex: privateKey.to_hex(),
    pkey: publicKey.to_bech32(),
    pkey_hex: publicKey.to_hex(),
    key_hash: keyHash.to_hex(),
    address_preview: enterpriseAddressPreview.to_address().to_bech32(),
    address_preprod: enterpriseAddressPreprod.to_address().to_bech32(),
    address_mainnet: enterpriseAddressMainnet.to_address().to_bech32(),
  };

  if (save_locally) {
    Deno.writeTextFileSync(
      `wallet_${new Date().getTime()}.json`,
      JSON.stringify(wallet),
    );
  } else {
    console.log(
      "WARNING: The wallet information has not been saved locally, you must keep this safe somewhere.",
    );
  }

  return wallet;
}

/**
 * Retrieves the Ed25519 key hash from a given private key.
 *
 * @param {string} private_key - The Bech32 encoded private key.
 * @returns {Ed25519KeyHash | undefined} The derived key hash, or undefined if invalid input.
 */
export function get_keyhash(private_key: string): Ed25519KeyHash | undefined {
  return Credential.from_keyhash(
    PrivateKey.from_bech32(private_key).to_public().hash(),
  ).to_keyhash();
}

/**
 * Converts a hexadecimal address string to an {@link Address} object.
 *
 * @param {string} address - The hexadecimal encoded address.
 * @returns {Address} The parsed address object.
 */
export function get_address(address: string): Address {
  return Address.from_hex(address);
}

/**
 * Converts a Bech32 encoded private key string to a {@link PrivateKey} object.
 *
 * @param {string} secret_key - The Bech32 encoded private key.
 * @returns {PrivateKey} The parsed private key object.
 */
export function get_private_key(secret_key: string): PrivateKey {
  return PrivateKey.from_bech32(secret_key);
}
