import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { TransactionStatus, User } from "@prisma/client";

type ResponseData = {
  user: User;
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

  const { txSignature, userId, points } = req.body;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!txSignature || !userId || !points) {
    return res.status(400).json({ message: "Missing params" });
  }

  const transaction = await prisma.userPointsDepositHistory.findUnique({
    where: {
      txSignature,
    },
  });
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  if (transaction.status != TransactionStatus.PENDING) {
    return res.status(404).json({ message: "Transaction already processed" });
  }

  // find user and check if exists
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    // Update transaction as failed
    await prisma.userPointsDepositHistory.update({
      where: {
        txSignature,
      },
      data: {
        status: TransactionStatus.FAILED,
      },
    });

    return res.status(500).json({ message: "User does not exist" });
  }

  // update user points
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      points: {
        increment: points * 1000,
      },
    },
  });

  // Update transaction as successed
  await prisma.userPointsDepositHistory.update({
    where: {
      txSignature,
    },
    data: {
      status: TransactionStatus.SUCCESSED,
    },
  });

  res.status(200).json({ user: updatedUser });
}
