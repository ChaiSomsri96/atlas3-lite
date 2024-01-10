import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";

import { RuleResult, UserResponseType } from "./types";
import { BlockchainNetwork, GiveawayRule, Wallet } from "@prisma/client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { ETHEREUM_RPC, SOLANA_RPC } from "../constants";

const checkWalletOwnsNftOnSolana = async (
  wallet: Wallet,
  collectionAddressOrContract: string
) => {
  const connection = new Connection(SOLANA_RPC);
  const walletPk = new PublicKey(wallet.address);
  const walletNfts = await Metadata.findDataByOwner(connection, walletPk);

  for (const walletNft of walletNfts) {
    // check collection
    console.log("walletNft", walletNft.mint);

    if (walletNft.collection?.key === collectionAddressOrContract) {
      return {
        ownsNft: true,
        uniqueConstraint: walletNft.mint,
      };
    }

    // check creators
    if (walletNft.data.creators?.length) {
      for (const creator of walletNft.data.creators) {
        if (creator.address === collectionAddressOrContract) {
          return {
            ownsNft: true,
            uniqueConstraint: walletNft.mint,
          };
        }
      }
    }
  }

  return {
    ownsNft: false,
    uniqueConstraint: "",
  };
};

const checkWalletOwnsNftOnEthereum = async (
  wallet: Wallet,
  collectionAddressOrContract: string
) => {
  const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC);
  const collectionContract = new ethers.Contract(
    collectionAddressOrContract,
    ["function balanceOf(address owner) view returns (uint256)"],
    provider
  );

  const balance = await collectionContract.balanceOf(wallet.address);
  console.log("Balance", balance);

  return {
    ownsNft: balance.gt(0),
    uniqueConstraint: wallet.address,
  };
};

export const checkOwnNft = async (
  user: UserResponseType,
  rule: GiveawayRule
): Promise<RuleResult> => {
  const { ownNftRule } = rule;
  if (!ownNftRule) return { rule };

  const userNetworkWallets = user.wallets.filter(
    (wallet) => ownNftRule.network === wallet.network
  );

  if (!userNetworkWallets.length) {
    return {
      rule,
      error: `You don't have a wallet on the ${ownNftRule.network} network`,
    };
  }
  let nftCheckResult: {
    ownsNft: boolean;
    uniqueConstraint: string | undefined;
  } = {
    ownsNft: false,
    uniqueConstraint: undefined,
  };

  for (const wallet of userNetworkWallets) {
    try {
      switch (ownNftRule.network) {
        case BlockchainNetwork.Solana:
          nftCheckResult = await checkWalletOwnsNftOnSolana(
            wallet,
            ownNftRule.collectionAddressOrContract
          );

          break;
        case BlockchainNetwork.Ethereum:
          nftCheckResult = await checkWalletOwnsNftOnEthereum(
            wallet,
            ownNftRule.collectionAddressOrContract
          );
          break;
      }

      if (nftCheckResult.ownsNft) {
        break;
      }
    } catch (error) {
      console.log(error);

      return {
        rule,
        error: `Error checking if you own an NFT on the ${ownNftRule.network} network`,
      };
    }
  }

  if (!nftCheckResult.ownsNft) {
    return {
      rule,
      error: `You don't own an NFT on the ${ownNftRule.network} network`,
    };
  }

  return {
    rule,
    uniqueConstraint: nftCheckResult.uniqueConstraint,
  };
};
