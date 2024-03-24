import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

export type UserWithdrawForgeRequest = {
  success: true;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserWithdrawForgeRequest | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { walletPublicKey, forge } = JSON.parse(req.body);

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      forgeStaked: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!forge) {
    return res.status(404).json({ message: "Missing forge amount" });
  }

  if (!user.forgeStaked) {
    return res.status(404).json({ message: "You have no FORGE to withdraw" });
  }

  if (forge < 0 )
  {
    return res.status(404).json({ message: "Forge amount must be greater than 0" });
  }


  if (user.forgeStaked && user.forgeStaked < forge * 1000) {
    return res.status(404).json({ message: "Not enough FORGE to withdraw" });
  }

  if (user.forgeStaked === 0) {
    return res.status(404).json({ message: "You have no FORGE to withdraw" });
  }

  // check if user has a unprocessed withdraw
  const unprocessedWithdraw = await prisma.userForgeWithdrawHistory.findFirst({
    where: {
      userId: session.user.id,
      processed: false,
    },
  });

  if (unprocessedWithdraw) {
    return res
      .status(404)
      .json({ message: "You already have a pending withdraw record." });
  }

  const fee = forge * 0.02;
  const forgeMinusFee = forge - fee;

  try {
    // create withdraw record
    const withdrawal = await prisma.userForgeWithdrawHistory.create({
      data: {
        userId: session.user.id,
        walletAddress: walletPublicKey,
        txSignature: "",
        processed: false,
        amount: forgeMinusFee,
      },
    });

    await prisma.userForgeWithdrawFeeHistory.create({
      data: {
        userId: session.user.id,
        fee,
        withdrawId: withdrawal.id,
      },
    });

    // set user forge staked to 0
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        forgeStaked: {
          decrement: forge * 1000,
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(404).json({
          message: "You already have a pending withdraw record.",
        });
      }
    }
    res
      .status(500)
      .json({ message: "An error occurred while processing your request" });
  }

  res.status(200).json({ success: true });
}
