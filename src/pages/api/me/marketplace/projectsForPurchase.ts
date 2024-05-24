import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type Project = {
  id: string;
  name: string;
  imageUrl: string | null;
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

  const allowlists = await prisma.allowlist.findMany({
    where: {
      enabled: true,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          phase: true,
          network: true,
          allowlistTradingEnabled: true,
        },
      },
    },
  });

  // get current listed marketplace records
  const listedProjects = await prisma.marketplaceRecord.findMany({
    where: {
      createdByUserId: session.user.id,
      listed: true,
    },
    select: {
      projectId: true,
    },
  });

  const listedProjectIds = listedProjects.map((p) => p.projectId);

  const projects: Project[] = [];

  for (const allowlist of allowlists) {
    if (
      allowlist.project?.phase === "PREMINT" &&
      !listedProjectIds.includes(allowlist.project.id) &&
      allowlist.project.network !== "TBD" &&
      allowlist.project.allowlistTradingEnabled
    ) {
      projects.push({
        id: allowlist.project.id,
        name: allowlist.project.name,
        imageUrl: allowlist.project.imageUrl,
      });
    }
  }

  res.status(200).json({ projects });
}
