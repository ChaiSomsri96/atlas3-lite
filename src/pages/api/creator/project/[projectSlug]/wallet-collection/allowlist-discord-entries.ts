import { isUserAdmin, isUserManager } from "@/backend/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import prisma from "@/backend/lib/prisma";

export type AllowlistDiscordEntryResponseData = {
  discordIds: string[];
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AllowlistDiscordEntryResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)
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

  const discordIds: string[] = [];

  for (const entry of allowlistEntries) {
    const discordId = accounts.find(x => x.userId === entry.userId)?.providerAccountId

    if (discordId) {
      discordIds.push(discordId);
    }
  }

  return res.status(200).json({ discordIds });
}
