import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

export type UserWithdrawPointsRequest = {
  success: true;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserWithdrawPointsRequest | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { walletPublicKey } = JSON.parse(req.body);

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      points: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.points === 0) {
    return res.status(404).json({ message: "You have no points to withdraw" });
  }

  // check they don't already have any buy records
  const buyRecords = await prisma.marketplaceRecord.findMany({
    where: {
      createdBy: {
        id: session.user.id,
      },
      tradeType: "BUY",
      processed: false,
      listed: true,
    },
  });

  if (buyRecords.length > 0) {
    return res.status(404).json({
      message:
        "You cannot submit a withdrawal with open buy orders. Please cancel the buy orders and try again.",
    });
  }

  // check if they have a pending presale entry intent
  const pendingPresaleEntryIntent = await prisma.presaleEntryIntent.findFirst({
    where: {
      userId: session.user.id,
      status: "PENDING",
    },
  });

  if (pendingPresaleEntryIntent) {
    return res.status(404).json({
      message:
        "You cannot submit a withdrawal with a pending presale entry transaction. Please try again later.",
    });
  }

  // check if user has a unprocessed withdraw
  const unprocessedWithdraw = await prisma.userPointsWithdrawHistory.findFirst({
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
  try {
    // create withdraw record
    await prisma.userPointsWithdrawHistory.create({
      data: {
        userId: session.user.id,
        walletAddress: walletPublicKey,
        txSignature: "",
        processed: false,
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
