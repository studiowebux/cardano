import {
  EnterpriseAddress,
  PrivateKey,
  Credential,
  NetworkInfo,
  Address,
  type Ed25519KeyHash,
  BaseAddress,
  RewardAddress,
  PublicKey,
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

/**
 * Retrieve from an address its stake key (if it has one)
 *
 * @param {string} address bech32 address
 * @returns {string} bech32 stake address
 */
export function address_to_stake(address: string): string {
  return RewardAddress.new(
    NetworkInfo.mainnet().network_id(),
    BaseAddress.from_address(Address.from_bech32(address))?.stake_cred()!,
  )
    .to_address()
    .to_bech32();
}

/**
 * Retrieves the public key from Ed25519 key hash.
 * Needed to get the public key from the signatories in ogmios block.
 *
 * @param {string} keyhash - The keyhash saved in a transaction (Format: Ed25519_PK...)
 * @returns {Ed25519KeyHash | undefined} The derived key hash, or undefined if invalid input.
 */
export function get_public_key_from_keyhash(
  keyhash: string,
): string | undefined {
  return PublicKey.from_hex(keyhash).to_bech32();
}

/**
 * From a bech32 address (with out without stake address)
 * returns the public keyhash to validate if a tx is signed by the expected address
 *
 * @param {string} address the bech32 address (addr...)
 * @returns {string} The Public key in bech32 format (Format: Ed25519_PK...)
 */
export function get_public_key_from_address(address: string): string {
  try {
    const enterprise_address = EnterpriseAddress.from_address(
      Address.from_bech32(address),
    );
    return PublicKey.from_hex(
      enterprise_address?.payment_cred().to_hex()!,
    ).to_bech32();
  } catch {
    try {
      const base_address = BaseAddress.from_address(
        Address.from_bech32(address),
      );
      return PublicKey.from_hex(
        base_address?.payment_cred().to_hex()!,
      ).to_bech32();
    } catch {
      throw new Error("Tried both type of address without success.");
    }
  }
}
