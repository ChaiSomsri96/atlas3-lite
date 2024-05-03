import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  PresaleEntryIntent,
  PresaleEntryIntentStatus,
  PresaleStatus,
} from "@prisma/client";
import { checkPresaleRules } from "@/backend/giveaway-rules";
import { RuleResult } from "@/backend/giveaway-rules/types";

export type CreatePresaleIntentRequestResponseData = {
  intentId: string;
  success: boolean;
  isSuccess: boolean;
  results: RuleResult[];
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreatePresaleIntentRequestResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { presaleSlug } = req.query;
  const { entryAmount, walletAddress } = JSON.parse(req.body);

  if (!presaleSlug) {
    return res.status(400).json({ message: "Missing presaleSlug" });
  }

  if (!entryAmount) {
    return res.status(400).json({ message: "Missing entryAmount" });
  }

  if (!walletAddress) {
    return res.status(400).json({ message: "Missing walletAddress" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const presale = await prisma.presale.findUnique({
    where: {
      slug: presaleSlug as string,
    },
  });

  if (!presale) {
    return res.status(404).json({ message: "Presale not found" });
  }

  const { results, errorMessage, isSuccess } = await checkPresaleRules(
    presale,
    user.accounts
  );

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  if (presale.status === PresaleStatus.FINALIZED) {
    return res.status(404).json({ message: "Presale is finished" });
  }

  if (entryAmount > presale.maxSupplyPerUser) {
    return res.status(404).json({
      message: `You can't enter more than ${presale.maxSupplyPerUser} times`,
    });
  }

  if (entryAmount <= 0) {
    return res.status(404).json({
      message: `Invalid entry amount`,
    });
  }

  const costPrice = presale.pointsCost * entryAmount;

  if (user.points < costPrice) {
    return res.status(404).json({
      message: `You don't have enough points to enter this presale`,
    });
  }

  const intent = await prisma.presaleEntryIntent.findFirst({
    where: {
      presaleId: presale.id,
      userId: session.user.id,
      status: PresaleEntryIntentStatus.PENDING,
    },
  });

  if (intent) {
    return res
      .status(404)
      .json({
        message:
          "You already have another transaction pending. Be patient degen!",
      });
  }

  let createdIntent: PresaleEntryIntent | null = null;

  if (isSuccess) {
    createdIntent = await prisma.presaleEntryIntent.create({
      data: {
        presaleId: presale.id,
        userId: session.user.id,
        entryAmount,
        status: PresaleEntryIntentStatus.PENDING,
        walletAddress,
      },
    });

    if (!createdIntent) {
      return res.status(500).json({ message: "Failed to create intent" });
    }
  }

  res
    .status(200)
    .json({
      intentId: createdIntent ? createdIntent.id : "",
      success: isSuccess,
      isSuccess,
      results,
    });
}
