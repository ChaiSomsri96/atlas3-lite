/*import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { parse } from "json2csv";
import prisma from "@/backend/lib/prisma";
import { OAuthProviders } from "@/shared/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  const lottery = await prisma.lottery.findUnique({
    where: {
      id: id as string,
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
    },
  });

  if (!lottery) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (lottery.status === "RUNNING") {
    return res.status(404).json({ message: "lottery is still running" });
  }

  const flattenedEntries = lottery.entries.map((entry) => {
    const discordAccount = entry.user.accounts.find(
      (account) => account.provider === OAuthProviders.DISCORD
    );

    const twitterAccount = entry.user.accounts.find(
      (account) => account.provider === OAuthProviders.TWITTER
    );

    return {
      "Wallet Address": entry.walletAddress,
      "Discord Username": discordAccount?.username,
      "Discord ID": discordAccount?.providerAccountId,
      Twitter: twitterAccount?.username,
      "FORGE Amount": entry.forgeEntered,
    };
  });

  const csv = flattenedEntries.length ? parse(flattenedEntries) : "";

  return res
    .status(200)
    .setHeader("Content-Type", "text/csv")
    .setHeader(
      "Content-Disposition",
      `attachment; filename=${lottery.id}-wallets.csv`
    )
    .send(csv);
}*/

export {};
