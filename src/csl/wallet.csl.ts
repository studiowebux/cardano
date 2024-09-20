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
    pkey_hex: publicKey.to_hex(), // Represent the hex that is save in ogmios transaction/signatories, useful to scan the chain searching for tx signed by this address.
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
 * Retrieves the Ed25519 key hash instance from a given private key (ed25519_sk).
 * When to use ?
 * I use this with create_policy_script, to get the mint_script / NativeScript
 *
 * @param {string} private_key - The Bech32 encoded private key. (Format: ed25519_sk...)
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
 * @param {string} address - The hexadecimal encoded address, address received from a wallet in hex format.
 * @returns {Address} The parsed address Instance (CSL).
 */
export function get_address(address: string): Address {
  return Address.from_hex(address);
}

/**
 * Converts a Bech32 encoded private key (ed25519_sk...) string to a {@link PrivateKey} object.
 * When to use ?
 * Sign your transation (witness), always use carefully !
 * In my case I use it to mint assets
 *
 * @param {string} secret_key - The Bech32 encoded private key (Format: ed25519_sk...).
 * @returns {PrivateKey} The parsed private key Instance.
 */
export function get_private_key(secret_key: string): PrivateKey {
  return PrivateKey.from_bech32(secret_key);
}

/**
 * Retrieve from a bech32 address its stake key (if it has one)
 *
 * @param {string} address bech32 address (bech32...)
 * @param {number} network_id (0 = testnet, 1 = mainnet)
 * @returns {string} bech32 format stake address (stake...)
 */
export function address_to_stake(
  address: string,
  network_id: number = NetworkInfo.mainnet().network_id(),
): string {
  return RewardAddress.new(
    network_id,
    BaseAddress.from_address(Address.from_bech32(address))?.stake_cred()!,
  )
    .to_address()
    .to_bech32();
}

/**
 * Retrieves the public key from Ed25519 key hash string (Ed25519_PK).
 * Needed to get the public key from the signatories in ogmios block.
 *
 * @param {string} keyhash - The keyhash saved in a transaction (Format: Ed25519_PK...)
 * @returns {string | undefined} The derived key hash, or undefined if invalid input.
 */
export function get_public_key_from_keyhash(
  keyhash: string,
): string | undefined {
  return PublicKey.from_hex(keyhash).to_bech32();
}

/**
 * Retrieves the public key from Ed25519 key hash.
 * When to use ?
 * Needed to get the key from the signatories in ogmios block.
 * I use this with the indexer to scan transaction searching for block that have a specific signature.
 *
 * @param {string} public_key_bech32 - Public key (Format: Ed25519_PK...)
 * @returns {string} Public key in hex
 */
export function get_public_key_hash_from_public_key(
  public_key_bech32: string,
): string | undefined {
  return PublicKey.from_bech32(public_key_bech32).to_hex();
}

/**
 * From a bech32 address (with out without stake address)
 * returns the public keyhash to validate if a tx is signed by the expected address
 *
 * When to use ?
 * When you need to get the public key (Ed25519_PK) from a bech32 address
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
