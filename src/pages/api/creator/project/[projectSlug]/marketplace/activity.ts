import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { MarketplaceActivity, MarketplaceRecord } from "@prisma/client";

export type MarketplaceProjectActivityData = {
  marketplaceRecord: MarketplaceRecord;
} & MarketplaceActivity;

export type MarketplaceProjectActivityResponseData = {
  records: MarketplaceProjectActivityData[];
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketplaceProjectActivityResponseData | ErrorData>
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
    select: {
      id: true,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const records = await prisma.marketplaceActivity.findMany({
    where: {
      marketplaceRecord: {
        project: {
          id: project.id,
        },
      },
    },
    include: {
      marketplaceRecord: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({ records });
}
