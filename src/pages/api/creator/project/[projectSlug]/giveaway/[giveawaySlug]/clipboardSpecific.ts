import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import prisma from "@/backend/lib/prisma";
import { OAuthProviders } from "@/shared/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { giveawaySlug, type } = req.query;

  const giveaway = await prisma.giveaway.findUnique({
    where: {
      slug: giveawaySlug as string,
    },
    include: {
      entries: {
        where: {
          isWinner: true,
        },
        include: {
          user: {
            include: {
              accounts: true,
            },
          },
        },
      },
      project: true,
    },
  });

  if (!giveaway) {
    return res.status(404).json({ message: "Project not found" });
  }

  const data = [];

  for (const entry of giveaway.entries) {
    const discordAccount = entry.user.accounts.find(
      (account) => account.provider === OAuthProviders.DISCORD
    );

    if (type === "discordPings") {
      data.push(`<@${discordAccount?.providerAccountId}>`);
    }

    if (type === "wallets") {
      data.push(entry.walletAddress);
    }

    if (type === "discordUsernames") {
      data.push(discordAccount?.username);
    }
  }

  console.log(data);

  res.status(200).json({ data });
}
