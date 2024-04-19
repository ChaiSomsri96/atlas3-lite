import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { checkDiscordRoleOnly } from "@/backend/giveaway-rules";
import { RuleResult } from "@/backend/giveaway-rules/types";

export type GiveawayEntryResponseData = {
  isSuccess: boolean;
  results: RuleResult[];
};

type GiveawayEntryErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GiveawayEntryResponseData | GiveawayEntryErrorData>
) {
  try {
    if (req.method !== "PUT") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { giveawaySlug } = req.query;
    const { userId } = JSON.parse(req.body);

    console.log(userId);

    if (!userId) {
      return res.status(400).json({ message: "Missing user id" });
    }

    if (!giveawaySlug) {
      return res.status(400).json({ message: "Missing giveawaySlug" });
    }

    const giveaway = await prisma.giveaway.findFirst({
      where: {
        slug: giveawaySlug as string,
      },
      include: {
        project: true,
      },
    });

    if (!giveaway) {
      return res.status(404).json({ message: "Giveaway not found" });
    }

    /*const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
    },
  });*/

    const accounts = await prisma.account.findMany({
      where: {
        userId: userId,
      },
    });

    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const discordAccount = accounts.find(
      (account) => account.provider === "discord"
    );

    if (!discordAccount) {
      return res.status(404).json({ message: "User has no discord account" });
    }

    const { errorMessage, isSuccess, results } = await checkDiscordRoleOnly(
      giveaway,
      accounts
    );

    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    return res.status(200).json({ isSuccess, results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
