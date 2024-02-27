import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "json2csv";
import prisma from "@/backend/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ombEntries = await prisma.userOMB.findMany({
    include: {
      user: true,
    },
  });

  const userIds = ombEntries
    .map((x) => x.userId)
    .filter((id) => id) as string[];

  const accounts = await prisma.account.findMany({
    where: {
      userId: {
        in: userIds,
      },
      provider: "discord",
    },
  });

  const entries: { username: string; walletAddress: string }[] = [];

  for (const entry of ombEntries) {
    const discordAccount = accounts.find((x) => x.userId === entry.userId);

    for (const walletAddress of entry.wallets) {
      if (walletAddress) {
        entries.push({
          username: discordAccount?.username ?? "Discord account unlinked",
          walletAddress: walletAddress,
        });
      }
    }
  }

  const csv = entries.length ? parse(entries) : "";

  return res
    .status(200)
    .setHeader("Content-Type", "text/csv")
    .setHeader("Content-Disposition", `attachment; filename=omb-wallets.csv`)
    .send(csv);
}
