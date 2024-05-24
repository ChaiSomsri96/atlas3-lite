import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { TradeType } from "@prisma/client";

type Project = {
  id: string;
  name: string;
  allowlistTradingEnabled: boolean;
  allowlistEnabled: boolean;
};
type ResponseData = {
  projects: Project[];
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // get projects available for listing based on allowlist entries
  const entries = await prisma.allowlistEntry.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      allowlist: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              phase: true,
              network: true,
              allowlistTradingEnabled: true,
              verified: true,
            },
          },
        },
      },
    },
  });

  // get current listed marketplace records
  const listedProjects = await prisma.marketplaceRecord.findMany({
    where: {
      createdByUserId: session.user.id,
      listed: true,
      tradeType: TradeType.SELL,
    },
    select: {
      projectId: true,
    },
  });

  const listedProjectIds = listedProjects.map((p) => p.projectId);

  let projects: Project[] = [];

  for (const entry of entries) {
    if (
      entry.allowlist.project &&
      entry.allowlist.project.phase === "PREMINT" &&
      entry.allowlist.project.network !== "TBD" &&
      entry.allowlist.project.verified
    ) {
      if (!listedProjectIds.includes(entry.allowlist.project.id)) {
        projects.push({
          ...entry.allowlist.project,
          allowlistEnabled: entry.allowlist.enabled,
        });
      }
    }
  }

  // filter so allowlist trading disabled is last
  projects = projects.sort((a, b) => {
    if (a.allowlistTradingEnabled && !b.allowlistTradingEnabled) {
      return -1;
    }
    if (!a.allowlistTradingEnabled && b.allowlistTradingEnabled) {
      return 1;
    }
    return 0;
  });

  res.status(200).json({ projects });
}
