import { isUserAdmin, isUserManager } from "@/backend/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import prisma from "@/backend/lib/prisma";
import { parse } from "json2csv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectSlug } = req.query;

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    include: {
      allowlist: true,
    },
  });

  if (!project || !project.allowlist) {
    return res.status(404).json({ message: "Project not found" });
  }

  const allowlistEntries = await prisma.allowlistEntry.findMany({
    where: {
      allowlistId: project.allowlist.id,
    },
  });

  const userIds = allowlistEntries
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

  if (
    !isUserAdmin(project, session.user.id) &&
    !isUserManager(project, session.user.id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!project.allowlist) {
    return res
      .status(403)
      .json({ message: "Project does not have an allowlist" });
  }

  const flattenedEntries = allowlistEntries.map((entry) => {
    const discordAccount = accounts.find((x) => x.userId === entry.userId);

    return {
      //  id: entry.id,
      //  roleId: entry.role?.id,
      "Role Name": entry.role?.name,
      // roleMultiplier: entry.role?.multiplier,
      "Wallet Address": entry.walletAddress,
      "Discord User ID":
        entry.source === "bulk-add"
          ? "Bulk Added User"
          : discordAccount?.providerAccountId ?? "Discord account unlinked",
      "Discord Username":
        entry.source === "bulk-add"
          ? "Bulk Added User"
          : discordAccount?.username ?? "Discord account unlinked",
    };
  });

  const data = flattenedEntries.length
    ? parse(flattenedEntries, { delimiter: "\t" })
    : "";

  res.status(200).json({ data });
}
