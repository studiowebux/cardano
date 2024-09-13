import {
  EnterpriseAddress,
  PrivateKey,
  Credential,
  NetworkInfo,
  Address,
  type Ed25519KeyHash,
} from "@emurgo/cardano-serialization-lib-nodejs";

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

export function get_keyhash(private_key: string): Ed25519KeyHash | undefined {
  return Credential.from_keyhash(
    PrivateKey.from_bech32(private_key).to_public().hash(),
  ).to_keyhash();
}

export function get_address(address: string): Address {
  return Address.from_hex(address);
}

export function get_private_key(secret_key: string): PrivateKey {
  return PrivateKey.from_bech32(secret_key);
}
