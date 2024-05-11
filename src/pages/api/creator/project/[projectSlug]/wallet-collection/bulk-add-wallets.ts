import { isUserAdmin } from "@/backend/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import prisma from "@/backend/lib/prisma";

export type BulkAddWalletsResponseData = {
  addedCount: number;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BulkAddWalletsResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectSlug } = req.query;
  const { wallets, roleName } = JSON.parse(req.body);

  if (!wallets) {
    return res.status(400).json({ message: "Missing wallets" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    include: {
      allowlist: {
        include: {
          entries: true,
        },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (project.allowlist?.type === "DISCORD_ROLE") {
    if (!roleName) {
      return res.status(400).json({ message: "Missing roleName" });
    }
  }

  if (!isUserAdmin(project, session.user.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!project.allowlist) {
    return res
      .status(403)
      .json({ message: "Project does not have an allowlist" });
  }

  // check if the added entries exceed the limit
  const currentEntriesCount = project.allowlist.entries.length;
  const newEntriesCount = wallets.length;

  if (
    project.allowlist.maxCap &&
    currentEntriesCount + newEntriesCount > project.allowlist.maxCap
  ) {
    return res.status(403).json({
      message: `Adding ${newEntriesCount} entries would exceed the max cap of ${project.allowlist.maxCap}`,
    });
  }

  const addedEntries = await prisma.allowlistEntry.createMany({
    data: wallets.map((wallet: string) => ({
      role: {
        id: "bulk-added",
        name: roleName ? roleName : "bulk-added",
      },
      source: "bulk-add",
      walletAddress: wallet,
      allowlistId: project.allowlist?.id,
    })),
  });

  return res.status(200).json({ addedCount: addedEntries.count });
}
