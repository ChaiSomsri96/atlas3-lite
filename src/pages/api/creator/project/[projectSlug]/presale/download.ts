import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { parse } from "json2csv";
import prisma from "@/backend/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectSlug } = req.query;

  // get all presales for project
  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    select: {
      id: true,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const presales = await prisma.presale.findMany({
    where: {
      projectId: project.id,
    },
    include: {
      entries: true,
    },
  });

  const entries = presales.flatMap((x) => x.entries);

  const userIds = entries.map((x) => x.userId).filter((id) => id) as string[];

  const accounts = await prisma.account.findMany({
    where: {
      userId: {
        in: userIds,
      },
      provider: "discord",
    },
  });

  const flattenedEntries = entries.map((entry) => {
    const discordAccount = accounts.find((x) => x.userId === entry.userId);
    const presaleName = presales.find((x) => x.id === entry.presaleId)?.name;

    return {
      Presale: presaleName,
      "Discord Username":
        discordAccount?.username ?? "Discord account unlinked",
      "Wallet Address": entry.walletAddress,
      Amount: entry.entryAmount,
    };
  });

  const csv = flattenedEntries.length ? parse(flattenedEntries) : "";

  return res
    .status(200)
    .setHeader("Content-Type", "text/csv")
    .setHeader(
      "Content-Disposition",
      `attachment; filename=${projectSlug}-presaleWallets.csv`
    )
    .send(csv);
}
