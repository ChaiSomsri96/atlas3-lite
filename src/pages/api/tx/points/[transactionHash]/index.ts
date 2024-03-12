import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { UserPointsDepositHistory } from "@prisma/client";

export type FetchTransactionResponse = {
  transaction: UserPointsDepositHistory;
};

type FetchTransactionErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FetchTransactionResponse | FetchTransactionErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { transactionHash } = req.query;
  if (!transactionHash) {
    return res.status(400).json({ message: "Missing transaction hash" });
  }

  try {
    const transaction = await prisma.userPointsDepositHistory.findUnique({
      where: {
        txSignature: transactionHash as string,
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({ transaction });
  } catch (ex) {
    return res.status(500).json({ message: (ex as Error).message });
  }
}
