import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { TransactionStatus, UserPointsDepositHistory } from "@prisma/client";

type ResponseData = {
  transaction: UserPointsDepositHistory;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const tx_listener_key = req.headers["tx-listener-key"];
  if (tx_listener_key != (process.env.TX_LISTENER_KEY as string)) {
    return res.status(401).json({ message: "Not allowed" });
  }

  try {
    const { txSignature, sender, tokenAddress, amount, userId } = req.body;

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (!txSignature || !sender || !tokenAddress || !amount) {
      return res.status(400).json({ message: "Missing params" });
    }

    let transaction = await prisma.userPointsDepositHistory.findUnique({
      where: {
        txSignature,
      },
    });

    if (transaction) {
      return res.status(404).json({ message: "Transaction already submitted" });
    }

    transaction = await prisma.userPointsDepositHistory.create({
      data: {
        txSignature,
        sender,
        tokenAddress,
        amount,
        status: TransactionStatus.PENDING,
        userId,
      },
    });

    res.status(200).json({ transaction });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
