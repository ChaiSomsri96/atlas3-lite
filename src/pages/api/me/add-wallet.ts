import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { User } from "@prisma/client";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { WalletSignature } from "@/backend/WalletSignature";
import { Connection } from "@solana/web3.js";
import { SOLANA_RPC } from "@/backend/constants";

type ResponseData = {
  user: User;
};

type ErrorData = {
  message: string;
};

const connection = new Connection(SOLANA_RPC);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { address, network, message, signedMessage, authTx } = JSON.parse(
    req.body
  );

  if (!address) {
    return res.status(400).json({ message: "Missing address" });
  }

  if (!network) {
    return res.status(400).json({ message: "Missing network" });
  }

  if (!authTx) {
    if (!message) {
      return res.status(400).json({ message: "Missing message" });
    }

    if (!signedMessage) {
      return res.status(400).json({ message: "Missing signed message" });
    }
  }

  if (authTx) {
    let tx;
    for (let i = 0; i < 10; i++) {
      const foundTx = await connection.getTransaction(authTx as string);

      if (foundTx) {
        tx = foundTx;
        break;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }

    if (!tx) {
      return res.send({
        message: "Transaction is not found",
      });
    }

    if (
      !tx.transaction.message.accountKeys
        .map((a) => a.toString())
        .includes(address)
    ) {
      return res.send({
        message: "Transaction is not signed by this address",
      });
    }
  } else {
    const verificationResult = await WalletSignature.verify({
      address,
      network,
      rawMessage: message,
      signedMessage,
    });

    console.log("verificationResult", verificationResult);

    if (!verificationResult.success) {
      throw new Error("Message validation unsuccessful");
    }
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const wallet = user.wallets.find(
    (wallet) => wallet.address === address && wallet.network === network
  );

  if (wallet) {
    return res.status(404).json({ message: "Wallet already exists" });
  }

  const networkWallets = user.wallets.filter(
    (wallet) => wallet.network === network
  );

  const shouldBeDefault =
    networkWallets.find((wallet) => wallet.isDefault) === undefined;

  const modifiedUser = await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      wallets: {
        push: {
          address,
          network,
          isDefault: shouldBeDefault,
        },
      },
    },
  });

  res.status(200).json({ user: modifiedUser });
}
