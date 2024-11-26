import {
  Address,
  RewardAddress,
  PublicKey,
  Ed25519Signature,
} from "@emurgo/cardano-serialization-lib-nodejs";
import { Buffer } from "node:buffer";
import {
  COSESign1,
  COSEKey,
  BigNum,
  Label,
  Int,
} from "@emurgo/cardano-message-signing-nodejs";

/**
 *
 * @param cose_signature The base64-encoded COSE signature to verify.
 * @param cose_key The base64-encoded COSE key to verify.
 *
 * @returns An object containing a boolean success flag and an optional stake address
 *           if the authentication is successful, or false otherwise. If the stake address
 *           is present, it includes both hex and Bech32 representations of the address.
 */
export function authenticate(
  cose_signature: string,
  cose_key: string,
): {
  success: boolean;
  stake_address?: {
    hex: string;
    besh32: string;
  };
} {
  const decoded = COSESign1.from_bytes(
    new Uint8Array(Buffer.from(cose_signature, "hex")),
  );
  const headermap = decoded.headers().protected().deserialized_headers();
  if (!headermap.header(Label.new_text("address"))) {
    return {
      success: false,
    };
  }
  const addressHex: string = Buffer.from(
    headermap.header(Label.new_text("address"))?.to_bytes()!,
  )
    .toString("hex")
    .substring(4);
  if (!addressHex) {
    return {
      success: false,
    };
  }
  const address = Address.from_bytes(
    new Uint8Array(Buffer.from(addressHex, "hex")),
  );

  const key = COSEKey.from_bytes(new Uint8Array(Buffer.from(cose_key, "hex")));
  const pubKeyBytes = key
    ?.header(Label.new_int(Int.new_negative(BigNum.from_str("2"))))
    ?.as_bytes();
  if (!pubKeyBytes) {
    return {
      success: false,
    };
  }
  const publicKey = PublicKey.from_bytes(pubKeyBytes);

  const payload = decoded.payload();
  const signature = Ed25519Signature.from_bytes(decoded.signature());
  const receivedData = decoded.signed_data().to_bytes();

  const signerStakeAddrHex = RewardAddress.from_address(address)?.to_address();
  if (!payload || !signerStakeAddrHex) {
    return {
      success: false,
    };
  }
  const utf8Payload = Buffer.from(payload).toString("utf8");
  const expectedPayload = `account: ${signerStakeAddrHex?.to_hex()}`; // reconstructed message

  // verify:
  const isVerified = publicKey.verify(receivedData, signature);
  const payloadAsExpected = utf8Payload === expectedPayload;

  const isAuthSuccess = isVerified && payloadAsExpected;

  return {
    success: isAuthSuccess,
    stake_address: {
      hex: signerStakeAddrHex?.to_hex(),
      besh32: signerStakeAddrHex?.to_bech32(),
    },
  };
}
