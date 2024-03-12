/*import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { Account, GiveawayStatus, LotteryEntry } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { OAuthProviders } from "@/shared/types";

export type LotteryEntryResponseData = {
  entry: LotteryEntry | undefined;
};

type GiveawayEntryErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LotteryEntryResponseData | GiveawayEntryErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const { forge } = JSON.parse(req.body);

  console.log(forge);

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  if (!forge) {
    return res.status(400).json({ message: "Missing forge" });
  }

  const forgeToUse = forge * 1000;

  const lottery = await prisma.lottery.findFirst({
    where: {
      id: id as string,
    },
  });

  if (!lottery) {
    return res.status(404).json({ message: "lottery not found" });
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

  if (!user.forgeStaked || user.forgeStaked === 0) {
    return res
      .status(400)
      .json({
        message:
          "You do not have any FORGE. Please deposit some FORGE and try again.",
      });
  }

  if (forgeToUse > user.forgeStaked) {
    return res
      .status(400)
      .json({
        message:
          "You do not have enough FORGE to make this stake. Please deposit some more and try again.",
      });
  }

  const wallet = user.wallets.find(
    (wallet) => wallet.network === lottery.network && wallet.isDefault
  );

  if (!wallet) {
    return res.status(400).json({
      message: `Please configure a default wallet for ${lottery.network}`,
    });
  }

  const lotteryEntry = await prisma.lotteryEntry.findFirst({
    where: {
      userId: session.user.id,
      lotteryId: lottery.id,
    },
  });

  if (lotteryEntry) {
    return res
      .status(400)
      .json({ message: "You have already entered this lottery." });
  }

  if (lottery.status !== GiveawayStatus.RUNNING) {
    return res.status(400).json({ message: "Giveaway is not running" });
  }

  const fee = forgeToUse * 0.002;
  const totalForge = forgeToUse - fee;

  let entry;
  try {
    entry = await prisma.lotteryEntry.create({
      data: {
        lottery: {
          connect: {
            id: lottery.id,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
        isWinner: undefined,
        walletAddress: wallet.address,
        forgeEntered: totalForge,
        discordUserId: user.accounts.find(
          (account: Account) => account.provider === OAuthProviders.DISCORD
        )?.providerAccountId,
        username: user.accounts.find(
          (account: Account) => account.provider === OAuthProviders.DISCORD
        )?.username,
      },
    });
  } catch (error) {
    console.log("Error creating entry", (error as Error).message);

    return res.status(400).json({
      message:
        "Failed to join, please raise a ticket in BSL if this issue persists.",
    });
  }

  await prisma.lottery.update({
    where: {
      id: lottery.id,
    },
    data: {
      usersEntered: {
        increment: 1,
      },
      totalForgePooled: {
        increment: totalForge,
      },
    },
  });

  // deduct forge from user
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      forgeStaked: {
        decrement: forgeToUse,
      },
    },
  });

  // increase for system user
  await prisma.user.update({
    where: {
      id: process.env.SYSTEM_USER_ID as string,
    },
    data: {
      forgeStaked: {
        increment: fee,
      },
    },
  });

  return res.status(200).json({ entry });
}
*/

export {};
