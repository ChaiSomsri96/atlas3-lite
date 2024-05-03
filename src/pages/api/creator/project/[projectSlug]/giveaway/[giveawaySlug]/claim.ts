import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  GiveawayStatus,
  GiveawayType,
  GiveawayWithdraw,
  TransactionStatus,
} from "@prisma/client";
import { add } from "date-fns";

type ResponseData = {
  giveawayWithdraw: GiveawayWithdraw;
};

type ErrorData = {
  message: string;
};

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

  const { projectSlug, giveawaySlug } = req.query;

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }
  if (!giveawaySlug) {
    return res.status(400).json({ message: "Missing giveawaySlug" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  /*
  if (!isUserAdmin(project, session.user.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  */

  if (!project.withdrawSOLAddress) {
    return res.status(400).json({
      message:
        "No withdraw address set. Set this on the giveaway settings page.",
    });
  }

  const giveaway = await prisma.giveaway.findUnique({
    where: {
      slug: giveawaySlug as string,
    },
    include: {
      paymentToken: true,
      entries: {
        select: {
          entryAmount: true,
        },
      },
    },
  });

  if (!giveaway) {
    return res.status(404).json({ message: "Giveaway not found" });
  }
  if (giveaway.status !== GiveawayStatus.FINALIZED) {
    return res.status(400).json({ message: "Giveaway not ended" });
  }
  if (giveaway.type !== GiveawayType.RAFFLE) {
    return res
      .status(400)
      .json({ message: "Payment available on raffle giveaways" });
  }
  if (!giveaway.paymentToken) {
    return res.status(400).json({ message: "Payment setting not enabled" });
  }
  if (giveaway.entryCount == 0) {
    return res.status(400).json({ message: "No entries in giveaway" });
  }

  let totalTickets = 0;
  for (const entry of giveaway.entries) {
    totalTickets += entry.entryAmount;
  }
  let withdrawAmount = (giveaway.paymentTokenAmount ?? 0) * totalTickets;
  if (withdrawAmount == 0) {
    return res.status(400).json({ message: "No withdraw amount" });
  }

  if (giveaway.paymentToken.tokenName == "FORGE") {
    withdrawAmount *= 0.95;
  } else {
    withdrawAmount *= 0.9;
  }

  const _giveawayWithdraw = await prisma.giveawayWithdraw.findUnique({
    where: {
      giveawayId: giveaway.id,
    },
  });
  if (_giveawayWithdraw) {
    return res.status(400).json({ message: "Already requested withdraw" });
  }

  const transactions = [];

  const now = new Date();
  for (let i = 1; i <= 8; i++) {
    transactions.push({
      amount: withdrawAmount / 8,
      status: TransactionStatus.PENDING,
      processDate: add(now, {
        days: i,
      }),
    });
  }

  const giveawayWithdraw = await prisma.giveawayWithdraw.create({
    data: {
      giveaway: {
        connect: {
          id: giveaway.id,
        },
      },
      transactions,
      isFinished: false,
    },
  });

  return res.status(200).json({ giveawayWithdraw });
}
