import nacl from "tweetnacl/nacl";
import bs58 from "bs58";
import { ethers } from "ethers";
import { redis } from "@/backend/lib/redis";
import { BlockchainNetwork } from "@prisma/client";

export const verifyNonce = async (address: string, nonce: string) => {
  const redisNonce = await redis.get(`nonce:${address}`);
  if (!redisNonce) {
    return false;
  }

  if (redisNonce !== nonce) {
    return false;
  }

  await redis.del(`nonce:${address}`);
  return true;
};

type VerifyNetworkInput = {
  rawMessage: string;
  signedMessage: string;
  address: string;
};

type VerifyNonceInput = {
  rawMessage: string;
  address: string;
};

type VerifyInput = {
  network: BlockchainNetwork;
  rawMessage: string;
  signedMessage: string;
  address: string;
};

type VerifyResult = {
  success: boolean;
};

export class WalletSignature {
  static _verifyBitcoinWallet({ address }: VerifyNetworkInput) {
    try {
      console.log(address);
      if (!address) return false;

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  static _verifyEthereumWallet({
    address,
    rawMessage,
    signedMessage,
  }: VerifyNetworkInput) {
    try {
      const derivedAddress = ethers.utils.verifyMessage(
        rawMessage,
        signedMessage
      );

      return derivedAddress === address;
    } catch (error) {
      return false;
    }
  }

  static _verifyAptosWallet(address: string) {
    try {
      console.log(address);
      if (!address) return false;

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  static _verifySuiWallet(address: string) {
    try {
      console.log(address);
      if (!address) return false;

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  static _verifyCardanoWallet(address: string) {
    try {
      console.log(address);
      if (!address) return false;

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  static _verifySolanaWallet({
    address,
    rawMessage,
    signedMessage,
  }: VerifyNetworkInput) {
    try {
      const decodedMessage = new TextEncoder().encode(rawMessage);
      const decodedSignedMesage = bs58.decode(signedMessage);
      const decodedAddress = bs58.decode(address);

      return !!nacl.sign.detached.verify(
        decodedMessage,
        decodedSignedMesage,
        decodedAddress
      );
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  static async _verifyNonce({ rawMessage, address }: VerifyNonceInput) {
    const nonceText = rawMessage.split("Nonce: ");
    if (nonceText.length !== 2) return false;

    const foundNonce = nonceText[1];
    await verifyNonce(address, foundNonce);

    return foundNonce;
  }

  static _verifyMessage({
    address,
    network,
    rawMessage,
    signedMessage,
  }: VerifyInput) {
    switch (network) {
      case BlockchainNetwork.Solana:
        return this._verifySolanaWallet({ address, rawMessage, signedMessage });
      case BlockchainNetwork.Ethereum:
      case BlockchainNetwork.Polygon:
        return this._verifyEthereumWallet({
          address,
          rawMessage,
          signedMessage,
        });
      case BlockchainNetwork.Aptos:
        return this._verifyAptosWallet(address);
      case BlockchainNetwork.Sui:
        return this._verifySuiWallet(address);
      case BlockchainNetwork.Cardano:
        return this._verifyCardanoWallet(address);
      case BlockchainNetwork.Bitcoin:
        return this._verifyBitcoinWallet({
          address,
          rawMessage,
          signedMessage,
        });
      default:
        throw new Error("Unknown network provided");
    }
  }

  static async verify({
    address,
    network,
    rawMessage,
    signedMessage,
  }: VerifyInput): Promise<VerifyResult> {
    if (!(await this._verifyNonce({ rawMessage, address }))) {
      return { success: false };
    }

    return {
      success: this._verifyMessage({
        address,
        network,
        rawMessage,
        signedMessage,
      }),
    };
  }
}
