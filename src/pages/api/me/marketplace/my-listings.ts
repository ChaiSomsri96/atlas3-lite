import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { MarketplaceRecord, Project, User } from "@prisma/client";

export type MarketplaceMyListingData = {
  createdBy: User;
  project: Project;
} & MarketplaceRecord;

export type MarketplaceMyListingResponseData = {
  records: MarketplaceMyListingData[];
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketplaceMyListingResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const records = await prisma.marketplaceRecord.findMany({
    where: {
      listed: true,
      createdByUserId: session.user.id,
    },
    include: {
      createdBy: true,
      project: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({ records });
}
