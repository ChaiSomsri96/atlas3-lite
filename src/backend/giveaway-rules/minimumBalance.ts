import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { ethers } from "ethers";

import { RuleResult, UserResponseType } from "./types";
import { BlockchainNetwork, GiveawayRule, Wallet } from "@prisma/client";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  ETHEREUM_RPC,
  SOLANA_RPC,
  TOKEN_PROGRAM_ID,
} from "../constants";

export function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey
): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  return address;
}

const getSolanaBalance = async (wallet: Wallet, tokenAddress: string) => {
  const connection = new Connection(SOLANA_RPC);
  const walletPk = new PublicKey(wallet.address);
  const tokenPk = new PublicKey(tokenAddress);

  if (tokenAddress === "NATIVE") {
    const balance = await connection.getBalance(walletPk);
    return balance / LAMPORTS_PER_SOL;
  }

  const ata = getAssociatedTokenAddress(tokenPk, walletPk);

  try {
    const ataBalance = await connection.getTokenAccountBalance(ata);
    return ataBalance.value.uiAmount || 0;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

const getEthereumBalance = async (wallet: Wallet, tokenAddress: string) => {
  const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC);

  if (tokenAddress === "NATIVE") {
    const balance = await provider.getBalance(wallet.address);
    return Number.parseFloat(ethers.utils.formatEther(balance));
  }

  const tokenContract = new ethers.Contract(
    tokenAddress,
    [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
    ],
    provider
  );
  const balance = await tokenContract.balanceOf(wallet.address);
  const decimals = await tokenContract.decimals();
  return balance.div(ethers.BigNumber.from(10).pow(decimals)).toNumber();
};

export const checkMinimumBalance = async (
  user: UserResponseType,
  rule: GiveawayRule
): Promise<RuleResult> => {
  const { minimumBalanceRule } = rule;
  if (!minimumBalanceRule) return { rule };

  const networkUserWallets = user.wallets.filter(
    (wallet) => wallet.network === minimumBalanceRule.network
  );
  if (!networkUserWallets.length) {
    return {
      rule,
      error: `You need to link a ${minimumBalanceRule.network} wallet to enter this giveaway`,
    };
  }

  let hasEnoughBalance = false;
  for (const wallet of networkUserWallets) {
    try {
      let balance: number;
      if (minimumBalanceRule.network === BlockchainNetwork.Solana) {
        balance = await getSolanaBalance(
          wallet,
          minimumBalanceRule.tokenAddress
        );
      } else if (minimumBalanceRule.network === BlockchainNetwork.Ethereum) {
        balance = await getEthereumBalance(
          wallet,
          minimumBalanceRule.tokenAddress
        );
      } else {
        return {
          rule,
          error: `Unsupported network ${minimumBalanceRule.network}`,
        };
      }

      console.log("Balance", balance);
      if (balance >= minimumBalanceRule.minimumBalance) {
        hasEnoughBalance = true;
        break;
      }
    } catch (error) {
      console.error(error);

      return {
        rule,
        error: `Error checking balance for ${wallet.address}`,
      };
    }
  }

  return {
    rule,
    error: hasEnoughBalance ? undefined : "You don't have enough balance",
  };
};
