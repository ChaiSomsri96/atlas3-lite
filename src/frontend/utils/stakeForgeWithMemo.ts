import { MEMO_PROGRAM_ID } from "@/shared/constants";
import {
  createTransferInstruction,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Session } from "next-auth";
import getOrCreateAssociatedTokenAccount from "./getOrCreateAssociatedTokenAccount";

type TransferParams = {
  connection: Connection;
  wallet: WalletContextState;
  to: PublicKey;
  mint: PublicKey;
  forge: number;
  session: Session | null;
};

export const stakeForgeWithMemo = async ({
  connection,
  wallet,
  to,
  mint,
  forge,
  session,
}: TransferParams) => {
  if (!wallet.publicKey || !wallet.signTransaction)
    throw new WalletNotConnectedError("Please connect a wallet.");

  if (!forge) throw new Error("Enter FORGE to stake");

  if (!session || !session.user.id) {
    throw new Error("You must be logged in to vote.");
  }

  const splToken = new PublicKey(mint);
  const mintInfo = await getMint(connection, splToken);
  if (!mintInfo) {
    throw new Error("Invalid token");
  }

  const amountBN = forge * Math.pow(10, mintInfo.decimals);

  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet.publicKey,
    splToken,
    wallet.publicKey,
    wallet.signTransaction
  );
  if (fromTokenAccount.amount < amountBN) {
    throw new Error("You do not have enough FORGE for this purchase.");
  }

  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet.publicKey,
    splToken,
    to,
    wallet.signTransaction
  );

  const transaction = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount.address, // source
      toTokenAccount.address, // dest
      wallet.publicKey,
      amountBN,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const txData = {
    store: "ATLAS3",
    type: "stake-forge",
    userId: session.user.id,
    forge,
  };

  transaction.add(
    new TransactionInstruction({
      keys: [
        {
          pubkey: wallet.publicKey,
          isSigner: true,
          isWritable: true,
        },
      ],
      data: Buffer.from(JSON.stringify(txData).replace(" ", ""), "utf8"),
      programId: MEMO_PROGRAM_ID,
    })
  );

  const latestBlockHash = await connection.getLatestBlockhash();
  transaction.feePayer = wallet.publicKey;
  transaction.recentBlockhash = latestBlockHash.blockhash;
  const signed = await wallet.signTransaction(transaction);

  const txSignature = await connection.sendRawTransaction(signed.serialize());

  const confirmedTxResult = await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    signature: txSignature,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  });

  if (confirmedTxResult.value.err) {
    throw new Error(confirmedTxResult.value.err.toString());
  }

  return txSignature;
};
