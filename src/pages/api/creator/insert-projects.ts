import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import {
  BlockchainNetwork,
  ProjectPhase,
  ProjectRoleType,
  ProjectStatus,
} from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const _projects = [];
  for (let i = 0; i < 24; i++) {
    _projects.push({
      name: `Test ${i}`,
      slug: `test-${i}`,
      description: `Test project - ${i}`,
      status: ProjectStatus.DRAFT,
      phase: "PREMINT" as ProjectPhase,
      network: "Solana" as BlockchainNetwork,
      roles: [
        {
          type: ProjectRoleType.ADMIN,
          userId: "63dbaa7af981ae3127361500",
        },
      ],
      mintDate: null,
      mintPrice: null,
      mintTime: null,
      discordGuild: null,
      twitterUsername: null,
      isFeatured: null,
      imageUrl: null,
      bannerUrl: null,
      websiteUrl: null,
      discordInviteUrl: null,
      rank: 10,
    });
  }

  await prisma.project.createMany({
    data: _projects,
  });

  res.status(200);
}
