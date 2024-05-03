import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { parse } from "json2csv";
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

  const { giveawaySlug, winnersOnly } = req.query;

  const isWinnersOnly = winnersOnly === "true";

  const giveaway = await prisma.giveaway.findUnique({
    where: {
      slug: giveawaySlug as string,
    },
    include: {
      entries: {
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

  const entries = isWinnersOnly
    ? giveaway.entries.filter((e) => e.isWinner)
    : giveaway.entries;

  const flattenedEntries = entries.map((entry) => {
    const discordAccount = entry.user.accounts.find(
      (account) => account.provider === OAuthProviders.DISCORD
    );

    const twitterAccount = entry.user.accounts.find(
      (account) => account.provider === OAuthProviders.TWITTER
    );

    return {
      Winner: entry.isWinner ? "Yes" : "No",
      "Wallet Address": entry.walletAddress,
      "Discord Username": discordAccount?.username,
      "Discord ID": discordAccount?.providerAccountId,
      Twitter: twitterAccount?.username,
      "Entry Amount": entry.entryAmount,
    };
  });

  const csv = flattenedEntries.length ? parse(flattenedEntries) : "";

  return res
    .status(200)
    .setHeader("Content-Type", "text/csv")
    .setHeader(
      "Content-Disposition",
      `attachment; filename=${giveaway.slug}-wallets.csv`
    )
    .send(csv);
}
